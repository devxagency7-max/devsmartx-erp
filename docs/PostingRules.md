# Posting Rules — DevSmartX ERP

**Status:** APPROVED  
**Last Updated:** 2026-08-02

---

## Purpose

Posting rules define how transactions move through their status lifecycle and what state changes are allowed. Any implementation of `ITransactionEngine` must enforce these rules without exception.

---

## 1. Transaction Status Lifecycle

```
PENDING ──→ COMPLETED
    │
    └──→ CANCELLED

COMPLETED ──→ (immutable — cannot change status)

FAILED (terminal — retry creates a new transaction)
```

### Allowed Transitions

| From | To | Condition |
|------|----|-----------|
| PENDING | COMPLETED | All required fields present and validated |
| PENDING | CANCELLED | Manual cancellation or auto-expiry |
| PENDING | FAILED | Processing error (payment gateway, etc.) |
| COMPLETED | — | No transitions allowed |
| CANCELLED | — | No transitions allowed |
| FAILED | — | No transitions allowed |

**COMPLETED is terminal.** There is no "void" or "reverse" status. Corrections use a new offsetting transaction.

---

## 2. Required Fields Before Posting

A transaction cannot move to `COMPLETED` unless all of the following fields are present and valid:

| Field | Validation Rule |
|-------|----------------|
| `amount` | `Money.isPositive()` must be true |
| `type` | Must be a valid `TransactionType` enum value |
| `walletId` | Must reference an active, non-deleted wallet |
| `categoryId` | Must reference an active category compatible with the transaction type |
| `date` | Must not be in the future (cannot post future-dated transactions) |
| `companyId` | Must match the authenticated user's company |
| `createdBy` | Must be the authenticated user's ID |

---

## 3. Wallet Transfer Posting

A wallet transfer is **atomic** — both legs post together or neither posts.

```
Step 1: Validate source wallet has sufficient balance
Step 2: Create outgoing leg (PENDING, source wallet, DEBIT)
Step 3: Create incoming leg (PENDING, destination wallet, CREDIT)
Step 4: Link both via referenceId
Step 5: Post both to COMPLETED in a single Firestore batch write
```

If Step 1 fails (insufficient balance), neither transaction is created.  
If Steps 2–5 fail mid-way, the Firestore batch is rolled back entirely.

---

## 4. Insufficient Balance Policy

By default, wallets **allow negative balances** (overdraft). This is intentional: many real-world cash accounts temporarily go negative due to timing (e.g., a check cleared before a deposit posts).

To enforce a strict no-overdraft policy for a specific wallet:
1. Add `allowOverdraft: false` to the Wallet entity (reserved for future implementation)
2. The engine checks `currentBalance - transactionAmount >= 0` before posting
3. If violated, the engine throws `InsufficientBalanceError`

This is a **per-wallet setting**, not a global policy.

---

## 5. Backdating Rules

Transactions may be backdated (date set to a past date) with the following constraints:

- The date cannot be before the wallet's `createdAt` date
- Backdated transactions recalculate all running balances from the backdate forward
- Backdating is logged in the audit trail with the original entry timestamp vs. the posted date

There is no time limit on how far back a transaction can be backdated. This is intentional for data migration scenarios.

---

## 6. Cancellation Rules

A `PENDING` transaction can be cancelled by:
- The user who created it (`createdBy === currentUserId`)
- Any user with the `finance.transactions.cancel` permission

When cancelled:
1. `status` changes to `CANCELLED`
2. `cancelledAt` and `cancelledBy` fields are set
3. An audit entry is written
4. Attached files remain (not deleted) for record-keeping

**A COMPLETED transaction cannot be cancelled.** Create a reversing transaction instead.

---

## 7. Reversing Transactions

To correct a completed transaction error:

```typescript
// Wrong: try to edit or cancel a completed transaction ✗

// Correct: create a reversing transaction ✓
await engine.createReversal(originalTransactionId, {
  reason: 'Duplicate entry',
  createdBy: currentUserId,
});
```

A reversal:
- Creates a new transaction with the same amount but opposite direction
- Sets `referenceId` to the original transaction's ID
- Posts directly to `COMPLETED` status (no PENDING step)
- Produces its own audit entry

---

## 8. Recurring Transaction Posting

When a recurring transaction (e.g., monthly subscription) fires:
1. A new `PENDING` transaction is created from the recurring template
2. The template's `nextDueDate` is advanced by the recurrence interval
3. The new transaction is auto-posted to `COMPLETED` if `autoPost: true` on the template
4. If `autoPost: false`, it waits in `PENDING` for manual review

Auto-posting only succeeds if all posting validations pass. Validation failures leave the transaction in `PENDING` and send a notification to the company admin.

---

## 9. Audit Entry on Every Post

Every status transition writes an `AuditEntry`. The service layer is responsible — components never write audit entries directly.

| Event | Audit Action |
|-------|-------------|
| Transaction created (PENDING) | `transaction.created` |
| Transaction posted (COMPLETED) | `transaction.posted` |
| Transaction cancelled | `transaction.cancelled` |
| Transaction failed | `transaction.failed` |
| Reversal created | `transaction.reversed` |

---

## 10. Engine Error Types

The `ITransactionEngine` implementation throws typed errors only:

| Error Class | When |
|------------|------|
| `InsufficientBalanceError` | Balance check fails (if overdraft disabled) |
| `InvalidTransactionStateError` | Attempted illegal status transition |
| `CurrencyMismatchError` | Transaction currency ≠ wallet currency |
| `WalletInactiveError` | Target wallet is deactivated |
| `CategoryIncompatibleError` | Category doesn't support the transaction type |
| `ValidationError` | Required field missing or invalid |

All errors extend a base `FinanceError` class which extends `AppError` (see system architecture Section 24).
