# Financial Architecture — DevSmartX ERP

**Status:** APPROVED  
**Last Updated:** 2026-08-02  
**Maintainer:** Engineering Team

---

## 1. Overview

The financial system is built on a single architectural principle:

> **Every financial movement is a Transaction. Balances, reports, and cash flow are always derived — never stored.**

This is called the **Transaction Engine Principle**. It eliminates an entire class of bugs where stored balance fields drift out of sync with actual transaction history.

---

## 2. Transaction Types

All money movement in the system is modeled as one of 11 transaction types:

| Type | Direction | Description |
|------|-----------|-------------|
| `EXPENSE` | Out | Any business expenditure |
| `REVENUE` | In | Income from sales or services |
| `PARTNER_CONTRIBUTION` | In | Capital contributed by a partner/owner |
| `PARTNER_WITHDRAWAL` | Out | Funds withdrawn by a partner/owner |
| `WALLET_TRANSFER` | Internal | Movement between two company wallets |
| `LOAN_RECEIVED` | In | External loan received |
| `LOAN_REPAYMENT` | Out | Repayment of a loan |
| `SALARY` | Out | Employee payroll |
| `SUBSCRIPTION` | Out | Recurring software/service fees |
| `REFUND` | In | Money returned from a vendor |
| `ASSET_PURCHASE` | Out | Purchase of a fixed asset |

`WALLET_TRANSFER` creates **two linked transactions** (debit + credit) automatically via the engine. They share a `referenceId` that links them.

---

## 3. Wallet Architecture

Wallets represent money containers (bank accounts, cash drawers, petty cash, etc.).

```
Wallet {
  id: string
  companyId: string
  name: string
  type: WalletType          // BANK | CASH | PETTY_CASH | CREDIT | SAVINGS | INVESTMENT
  currency: Currency
  openingBalance: Money     // Set once at creation
  isActive: boolean
  // NO balance field — derived via IBalanceCalculator
}
```

**Balance Derivation Formula:**

```
currentBalance = openingBalance + Σ(inflows) - Σ(outflows)
```

Where inflows/outflows are only `COMPLETED` transactions. `PENDING` and `CANCELLED` transactions are excluded from balance calculations.

---

## 4. Money Value Object

All monetary amounts use the `Money` value object — never raw numbers.

```typescript
const amount = Money.of(1500, Currency.of('EGP'));
const tax    = amount.multiply(0.14);
const total  = amount.add(tax);

total.format();     // "EGP 1,710.00"
total.toNumber();   // 1710
```

Key properties:
- **Immutable** — every operation returns a new `Money` instance
- **Integer-safe** — uses `Math.round(amount * factor)` to avoid float drift
- **Currency-guarded** — `add()` and `subtract()` throw if currencies don't match
- **Comparable** — `equals()`, `greaterThan()`, `lessThan()` for business rule checks

---

## 5. Service Interface Layer

No component or hook calls Firebase/Firestore directly. All financial operations go through service interfaces:

```
Component → Hook → Service Interface → Implementation → Firestore
```

| Interface | Responsibility |
|-----------|---------------|
| `ITransactionEngine` | Create, update, cancel, transfer transactions |
| `IBalanceCalculator` | Derive current balance for a wallet |
| `ILedgerService` | Build chronological ledger with running balance |
| `ICashFlowCalculator` | Compute inflows/outflows over a date range |

The service interfaces live in `src/features/finance/domain/services/`. Concrete implementations (Firebase) will be added in a future phase and registered via dependency injection.

---

## 6. Category System

Every transaction must have a `TransactionCategory`. Categories are:

- **Hierarchical**: parent categories group sub-categories (e.g., `Operating Expenses > Rent`)
- **Type-constrained**: a category can be restricted to specific `TransactionType` values
- **Company-scoped**: each company manages its own category tree
- **Immutable for historical records**: deleting a category with transactions is blocked; instead mark `isActive: false`

---

## 7. Attachment Support

Transactions support multiple file attachments (receipts, invoices, contracts):

```typescript
TransactionAttachment {
  id, transactionId, companyId
  fileUrl: string       // Cloudinary URL only
  fileName: string
  fileSize: number      // bytes
  mimeType: string
  uploadedBy: string
  uploadedAt: Date
}
```

All attachments are stored via Cloudinary (see ADR-003). Direct Firebase Storage usage is prohibited for financial documents.

---

## 8. Audit Requirements

Every financial transaction write (create, update, cancel) must produce an `AuditEntry`. This is enforced by the service layer — components and hooks never write audit records directly.

See `docs/01_System_Architecture.md` Section 28 for the full `AuditEntry` interface.

---

## 9. Multi-Currency Support

The system supports EGP, USD, EUR, SAR, and AED out of the box. The `Currency` value object validates codes at construction time. Multi-currency transactions are **not** automatically converted — they are recorded in their original currency and reports can request conversion at query time.

---

## 10. What This Architecture Prevents

| Anti-Pattern | How We Prevent It |
|---|---|
| Stored balance field that drifts | `Wallet` has no `balance` field |
| Float arithmetic errors | `Money` uses integer-scale math |
| Direct Firestore calls in components | Service interface layer is mandatory |
| Currency mismatch bugs | `Money.add()` throws on currency mismatch |
| Orphaned attachments | Attachment entity references `transactionId` |
| Silent data loss on transfer | Transfer creates two linked transactions atomically |
