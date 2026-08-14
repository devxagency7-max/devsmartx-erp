# Architecture Decision Summary — Financial Module

**Status:** APPROVED  
**Last Updated:** 2026-08-02

---

## Purpose

A quick-reference summary of every architectural decision made for the financial module. Each decision has a rationale and the alternative that was considered and rejected.

---

## Decision 1: Transaction Engine Principle

**Decision:** Balances are always derived from transaction history. No entity stores a balance field.

**Rationale:** Stored balance fields inevitably drift from actual transaction totals due to race conditions, partial writes, and code paths that bypass the normal update flow. Derived balances are always correct by definition.

**Rejected Alternative:** Storing `currentBalance` on the Wallet entity and updating it on every transaction.

**Why rejected:** A single missed update (e.g., a failed batch write, a bug in a new code path) creates silent corruption that is hard to detect and impossible to auto-correct.

---

## Decision 2: Money as an Immutable Value Object

**Decision:** All monetary amounts are represented as `Money` instances, never as raw `number`.

**Rationale:** JavaScript's IEEE 754 floating-point arithmetic produces incorrect results for money math (e.g., `0.1 + 0.2 === 0.30000000000000004`). The `Money` value object uses integer-scale arithmetic and enforces currency constraints at the type level.

**Rejected Alternative:** Storing amounts as `number` and applying `toFixed(2)` when displaying.

**Why rejected:** `toFixed` is for display only — it doesn't fix intermediate calculation errors. A chain of operations (tax + discount + rounding) will accumulate errors.

---

## Decision 3: 11 Transaction Types (Closed Enum)

**Decision:** The system supports exactly 11 transaction types, defined as a TypeScript `const enum`. New types require an explicit architecture review.

**Rationale:** A finite, well-understood set of transaction types allows the ledger direction mapping, category compatibility rules, and reporting logic to be exhaustive and compiler-checked.

**Rejected Alternative:** Free-form transaction type strings or an extensible open set.

**Why rejected:** Open sets make exhaustive switch statements impossible, break report categorization, and make the ledger direction mapping ambiguous.

---

## Decision 4: Service Interface Layer (No Direct Firestore in Components)

**Decision:** All financial operations go through a service interface (`ITransactionEngine`, `IBalanceCalculator`, etc.). Components and hooks never call Firestore directly.

**Rationale:** The service interface layer decouples business logic from the data store. This allows unit testing without Firebase, future migration to a different backend, and a single place to enforce validation and audit logging.

**Rejected Alternative:** Calling Firestore directly from hooks or components.

**Why rejected:** Business rules (validation, audit entries, atomic transfers) cannot be reliably enforced when callers bypass the service layer.

---

## Decision 5: Wallet Transfer as Two Linked Transactions

**Decision:** A wallet-to-wallet transfer creates two separate transactions (outgoing + incoming) linked by a `referenceId`, written atomically via Firestore batch.

**Rationale:** The ledger is per-wallet. A single "transfer" record cannot appear in two wallets' ledgers simultaneously without duplication. Two linked transactions each appear naturally in their own wallet's ledger.

**Rejected Alternative:** A single `WALLET_TRANSFER` transaction with `fromWalletId` and `toWalletId` fields.

**Why rejected:** This transaction would need to appear in two different ledgers simultaneously, breaking the clean "one transaction = one ledger entry" model and complicating balance calculation.

---

## Decision 6: COMPLETED Status is Terminal

**Decision:** Once a transaction reaches `COMPLETED`, it cannot be modified, voided, or cancelled. Corrections use a new reversing transaction.

**Rationale:** Financial records must be immutable once posted. An audit trail that can be silently edited provides no actual audit guarantee. Reversing transactions create a complete correction history.

**Rejected Alternative:** Allow editing of completed transactions with an "edit reason" field.

**Why rejected:** This approach can hide errors, makes the audit trail ambiguous, and makes it impossible to reconstruct the exact state of accounts at a historical point in time.

---

## Decision 7: Currency as a Value Object (5 Supported Codes)

**Decision:** Currency is a value object with a factory method that validates against the supported code list: `EGP, USD, EUR, SAR, AED`. Unknown codes throw at construction time.

**Rationale:** Runtime validation at the boundary (construction) prevents invalid currency codes from propagating into the system. Typed at compile time via a union type.

**Rejected Alternative:** Free-form currency code string stored directly on `Money`.

**Why rejected:** Invalid codes (typos, unsupported currencies) would only be discovered at display time, far from the source of the error.

---

## Decision 8: Attachments via Cloudinary Only

**Decision:** Transaction attachments (receipts, invoices) are stored exclusively via Cloudinary. Direct Firebase Storage upload for financial documents is prohibited.

**Rationale:** Consistent with the system-wide upload strategy (ADR-003). Cloudinary provides CDN, image optimization, and secure signed URLs without additional infrastructure.

**Rejected Alternative:** Firebase Storage for financial documents.

**Why rejected:** Would create two upload pipelines to maintain. Also, Firebase Storage URLs expire unless configured carefully, which can break historical attachment links.

---

## Decision 9: Categories are Company-Scoped and Hierarchical

**Decision:** Transaction categories belong to a company (not a global list) and support one level of parent-child hierarchy.

**Rationale:** Different companies have radically different category structures. A global shared category list would be either too generic to be useful or too specific to fit all companies.

**Rejected Alternative:** Global shared category library that companies can customize.

**Why rejected:** Synchronization complexity (global changes affecting existing company data), and the reality that category naming conventions vary so much by industry that a global list adds little value.

---

## Decision 10: Domain Layer Has Zero Runtime Dependencies

**Decision:** The `src/features/finance/domain/` folder contains only TypeScript types, interfaces, enums, and value objects. It imports nothing from React, Firebase, or any third-party library.

**Rationale:** The domain layer represents pure business logic. It should be runnable and testable in any JavaScript environment without any setup.

**Rejected Alternative:** Importing Firebase types (like `Timestamp`) directly into domain entities.

**Why rejected:** Couples the domain model to a specific data store. Migration to a different backend would require rewriting domain entities.

---

## Summary Table

| # | Decision | Status |
|---|----------|--------|
| 1 | Transaction Engine Principle (no stored balances) | FINAL |
| 2 | Money as immutable value object | FINAL |
| 3 | 11 transaction types (closed enum) | FINAL |
| 4 | Service interface layer (no direct Firestore) | FINAL |
| 5 | Transfer = two linked transactions | FINAL |
| 6 | COMPLETED is terminal (reversals only) | FINAL |
| 7 | Currency as value object (5 codes) | FINAL |
| 8 | Attachments via Cloudinary only | FINAL |
| 9 | Categories are company-scoped and hierarchical | FINAL |
| 10 | Domain layer has zero runtime dependencies | FINAL |
