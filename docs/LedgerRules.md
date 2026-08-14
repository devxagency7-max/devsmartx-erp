# Ledger Rules — DevSmartX ERP

**Status:** APPROVED  
**Last Updated:** 2026-08-02

---

## Purpose

This document defines the exact rules for how transactions appear in the ledger. Any implementation of `ILedgerService` must follow these rules exactly to produce consistent, auditable financial records.

---

## 1. What Is the Ledger?

The ledger is a chronological list of all `COMPLETED` transactions for a wallet or company, with a running balance column. It is always **derived on-demand** — it is never stored.

```
Date       | Description              | Debit  | Credit | Balance
-----------|--------------------------|--------|--------|----------
2026-01-01 | Opening Balance          |        |        | 10,000
2026-01-05 | Rent Expense             | 2,500  |        |  7,500
2026-01-10 | Client Revenue           |        | 5,000  | 12,500
2026-01-15 | Salary - Engineering     | 8,000  |        |  4,500
```

---

## 2. Transaction Inclusion Rules

A transaction appears in the ledger **only if**:

1. `status === TransactionStatus.COMPLETED`
2. `isDeleted === false`
3. The transaction `date` falls within the requested date range
4. The transaction's `walletId` matches the requested wallet (for wallet-level ledger)

**Excluded from the ledger:**
- `PENDING` transactions
- `CANCELLED` transactions
- `FAILED` transactions
- Soft-deleted transactions (`isDeleted: true`)

---

## 3. Ordering Rules

Transactions in the ledger are ordered by:

1. **Primary**: `transaction.date` ascending (oldest first)
2. **Secondary**: `transaction.createdAt` ascending (for same-date transactions)
3. **Tertiary**: `transaction.id` ascending (deterministic tiebreaker)

This ordering must be stable — the same query with the same data must always produce the same ledger.

---

## 4. Running Balance Calculation

The running balance starts from the wallet's `openingBalance` and accumulates:

```
CREDIT transactions → add to running balance
DEBIT transactions  → subtract from running balance
```

**Direction mapping by transaction type:**

| TransactionType | Direction |
|----------------|-----------|
| REVENUE | CREDIT |
| PARTNER_CONTRIBUTION | CREDIT |
| LOAN_RECEIVED | CREDIT |
| REFUND | CREDIT |
| EXPENSE | DEBIT |
| PARTNER_WITHDRAWAL | DEBIT |
| LOAN_REPAYMENT | DEBIT |
| SALARY | DEBIT |
| SUBSCRIPTION | DEBIT |
| ASSET_PURCHASE | DEBIT |
| WALLET_TRANSFER (incoming leg) | CREDIT |
| WALLET_TRANSFER (outgoing leg) | DEBIT |

---

## 5. Opening Balance Entry

When building a wallet ledger, the first row is always a virtual "Opening Balance" entry:

```typescript
{
  date: wallet.createdAt,
  description: 'Opening Balance',
  debit: Money.zero(wallet.currency),
  credit: wallet.openingBalance,
  runningBalance: wallet.openingBalance,
  transactionId: null,   // virtual row, no transaction
}
```

---

## 6. Date Range Filtering

Ledger queries accept an optional date range `{ from: Date, to: Date }`.

- If `from` is provided, the running balance at `from - 1 day` is computed first (as the "brought forward" balance), then only transactions on or after `from` are shown.
- If `to` is provided, transactions with `date > to` are excluded.
- If no range is provided, the full history from `openingBalance` forward is returned.

This means a filtered ledger always shows the correct opening balance for the selected period.

---

## 7. Wallet Transfer Ledger Appearance

A `WALLET_TRANSFER` creates two linked transactions (outgoing + incoming). In the ledger:

- The **source wallet's ledger** shows the outgoing leg as a DEBIT with description `Transfer to [destination wallet name]`
- The **destination wallet's ledger** shows the incoming leg as a CREDIT with description `Transfer from [source wallet name]`
- Both rows share the same `referenceId` for traceability

---

## 8. Pagination

The `ILedgerService.getLedger()` method supports cursor-based pagination:

```typescript
getLedger(filter: TransactionFilter): Promise<{
  entries: LedgerEntry[];
  nextCursor: string | null;
  totalCount: number;
}>
```

The cursor is based on `(date, createdAt, id)` — the same ordering tuple used for sorting. Never use offset-based pagination for ledger data (it breaks consistency under concurrent inserts).

---

## 9. Currency Consistency

A wallet ledger is always single-currency (the wallet's own currency). The `IBalanceCalculator` will throw if it encounters a `Money` amount with a different currency code than the wallet's currency. Mixed-currency ledgers are not supported.

---

## 10. Immutability of Historical Records

Once a transaction is `COMPLETED`, its financial fields (`amount`, `walletId`, `type`, `date`) are **locked**. Corrections must be made via a reversing transaction (a new transaction that offsets the error), not by editing the original. This rule is enforced by `ITransactionEngine`.
