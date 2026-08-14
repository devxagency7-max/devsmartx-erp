# Phase 18A — Architecture Impact Report: Wallet → Payment Sources

**Version:** 1.0 PROPOSED  
**Date:** 2026-08-13  
**Status:** FOR REVIEW — DO NOT IMPLEMENT  
**Prepared by:** Architecture Review (no code was modified)

---

## A. Current Wallet Dependency Map

### What a Wallet Is Today

`WalletRecord` is a money-container entity with these properties that matter to the dependency graph:

| Field | Consumers |
|---|---|
| `id` | TransactionRecord.walletId, TransactionRecord.destinationWalletId, RecurringCommitmentRecord.defaultWalletId, CreateSettlementInput.walletId, walletService.getDerivedBalance(), useCreateTransaction hook |
| `name` | TransactionRecord.walletName, TransactionRecord.destinationWalletName, commitmentService (wallet.name), personService (wallet.name), WalletDetailsPage, WalletCard |
| `currency` | TransactionRecord.currency (type-narrowed via CurrencyCode), expense/revenue StepWallet sets form currency from wallet.currency, TransactionForm |
| `type` (WalletType enum) | WalletTypeBadge, CreateWalletForm, walletExportColumns, wallet schema validation |
| `status` | walletService.getAll() filters out `archived`, StepWallet and CommitmentForm filter `w.status === 'active'` |
| `openingBalance` | WalletDetailsPage display, walletService.getDerivedBalance() (placeholder returns it), walletExportColumns currentBalance column |
| `code` | WalletDetailsPage, walletExportColumns, CreateWalletForm (user-defined, unique) |

### Direct Consumers of walletService

| File | What it calls |
|---|---|
| `useCreateTransaction.ts` | `walletService.getById(walletId)` + `walletService.getById(destinationWalletId)` |
| `commitmentService.ts` — `markPaid()` | `walletService.getById(input.walletId)` |
| `personService.ts` — `createSettlement()` | `walletService.getById(input.walletId)` |
| `commitmentService.ts` — `create()` | `walletService.getById(input.defaultWalletId)` |
| `WalletListPage.tsx` | `walletService.getDerivedBalance()` for export |

### Direct Consumers of useWallets() hook

| File | Pattern Used |
|---|---|
| `StepWallet.tsx` (expense wizard) | `const { wallets, isLoading } = useWallets()` → filters `w.status === 'active'` |
| `StepWallet.tsx` (revenue wizard) | same pattern |
| `CreateTransactionPage.tsx` | `const { wallets } = useWallets()` → maps to `WalletOption[]` |
| `CommitmentForm.tsx` | `const { wallets } = useWallets()` |
| `CommitmentDetailsPage.tsx` | `const { wallets } = useWallets()` |
| `CreateSettlementPage.tsx` | `const { wallets } = useWallets()` |
| `WalletListPage.tsx` | `const { wallets, isLoading, isError, error, refetch } = useWallets()` |

### Direct Consumers of CurrencyCode (imported from wallet.types.ts)

| File | Import |
|---|---|
| `transaction.types.ts` | imports from wallet.types.ts then re-exports |
| `commitmentService.ts` | imports for currency cast |
| `personService.ts` | imports for currency cast |
| `StepReview.tsx` (expense) | imports for formatAmount call |
| `CreateWalletForm.tsx` | imports for CURRENCIES array type |

### Summary: 6 feature slices, 12+ files directly depend on the Wallet module.

---

## B. Current Balance Dependency Map

### How Balances Are Derived Today

The `IBalanceCalculator` interface defines:

```
computeBalance(walletId, completedTransactions) → Money
```

The **concrete implementation is not yet wired** — `walletService.getDerivedBalance()` is a placeholder that returns `openingBalance` directly. The proper derivation formula from FinancialArchitecture.md is:

```
currentBalance = openingBalance + Σ(COMPLETED inflows) - Σ(COMPLETED outflows)
```

### Balance Display Points

| Surface | Current State |
|---|---|
| WalletDetailsPage | Shows `openingBalance` and a "Transaction Engine pending" placeholder for derived balance |
| WalletCard | Shows `openingBalance` as balance |
| WalletListPage export | Calls `walletService.getDerivedBalance()` which returns `openingBalance` |
| Dashboard | No wallet balance widget implemented yet |
| TransactionRecord | No balance stored — correct by design |

### Key Observation

Balance derivation is not yet real. The formula exists in the architecture docs, the `IBalanceCalculator` interface is defined, but no concrete implementation aggregates transactions. **This means any Payment Source refactor does NOT need to migrate existing balance data — there is no live balance state to migrate.**

---

## C. Transaction Engine Impact

### What Would Change

`TransactionRecord` has:

```typescript
walletId: string;
walletName: string;
destinationWalletId: string | null;
destinationWalletName: string | null;
```

Under a Payment Sources model, these fields would become:

```typescript
paymentSourceId: string;
paymentSourceName: string;
destinationPaymentSourceId: string | null;
destinationPaymentSourceName: string | null;
```

### Files Affected by the Field Rename

- `TransactionRecord` interface itself
- `transactionService.create()` signature (takes `walletName: string`)
- `transactionService.createFromRecord()` (pre-built records from commitmentService and personService that set `walletId` and `walletName`)
- `applyFilters()` in transactionService that filters by `filters.walletId`
- `TransactionFilters` interface (`walletId: string`)
- `TransactionListPage` and `TransactionFiltersBar` — filter UI by wallet
- `useCreateTransaction` hook which calls `walletService.getById(input.walletId)`
- Ledger entries (`walletId` is the join key for per-wallet balance computation)

### Impact Rating: HIGH

Renaming `walletId` → `paymentSourceId` in `TransactionRecord` is a cross-cutting change that touches every financial record in the system. It would require updating all 12+ consumers and a coordinated migration of existing transaction data.

### What Would NOT Change

The Transaction Engine principle is storage-medium agnostic. No new transaction types need to be created. The semantics remain the same — only the field name changes.

---

## D. Transfer Impact

Wallet transfers (`TransactionType.Transfer`) create two linked transactions via `destinationWalletId`. The two-linked-transaction pattern (Architecture Decision 5) is directly coupled to the "Wallet" concept.

Under Payment Sources:
- The transaction type `Transfer` already doesn't embed "Wallet" in its string value — no enum change needed
- `destinationWalletId` → `destinationPaymentSourceId`
- The `ILedgerService` description of transfer appearance ("Transfer to [destination wallet name]") updates to use payment source name

The two-linked-transaction pattern itself is sound regardless of what we call the containers. No structural pattern change required.

**Impact Rating: MEDIUM** — field renames and description updates only.

---

## E. Expense Workflow Impact

The Expense wizard has a dedicated `StepWallet` step that:

1. Calls `useWallets()` to list active wallets
2. Lets the user pick one → sets `walletId`, `walletName`, `currency` in `WorkflowFormData`
3. The currency of the selected wallet auto-selects the transaction currency

Under Payment Sources:
- Step label changes from "Select Wallet" to "Select Payment Source"
- Hook call changes from `useWallets()` to `usePaymentSources()`
- `WorkflowFormData` fields `walletId` / `walletName` → `paymentSourceId` / `paymentSourceName`
- The currency-follows-wallet behavior depends on whether Payment Sources still carry a `currency` field

**Critical risk:** if Payment Sources decouple currency from the source, the auto-currency selection logic breaks and an additional "select currency" step is needed in every expense and revenue form.

**Impact Rating: HIGH** — wizard step rename, hook call change, potential UX flow change.

---

## F. Revenue Workflow Impact

Identical to the Expense impact — the Revenue wizard has its own `StepWallet.tsx` with the same pattern. Both must be updated together.

**Impact Rating: HIGH** (same as Expense).

---

## G. PaymentMethod vs PaymentSource Distinction

This is the most important conceptual question in the refactor.

### Current State

| Concept | Where It Lives | What It Does |
|---|---|---|
| **PaymentMethod** | `PaymentMethod` enum + PaymentMethodRecord master-data type | HOW money moves: Cash, BankTransfer, Card, Instapay, VodafoneCash, Cheque, Other |
| **Wallet** | `WalletRecord` + `WalletType` enum | WHERE money is held: Bank, Cash, PettyCash, DigitalWallet, Partner, Investment |

These are orthogonal dimensions:
- You pay via **BankTransfer** (method) from **Main Bank Account** (wallet/source)
- You pay via **Cash** (method) from **Petty Cash** (wallet/source)

### The Payment Sources Concept

A "Payment Source" would represent both where money is held AND how it is typically accessed:

| Payment Source Name | Type | Default Method | Currency |
|---|---|---|---|
| Main Bank Account | Bank | BankTransfer | EGP |
| Petty Cash Box | Cash | Cash | EGP |
| Company Visa | CreditCard | Card | USD |
| Instapay Account | Digital | Instapay | EGP |

### Recommendation

**Keep `PaymentMethod` as a transaction-level attribute (the "how") and rename Wallet → PaymentSource (the "where"). Do not merge them.**

This preserves the ability to filter and report on payment methods independently of payment sources.

---

## H. People Ledger Integration Boundary

People Ledger uses Wallets in exactly one place: `personService.createSettlement()`.

```typescript
const wallet = await walletService.getById(input.walletId);
walletId: input.walletId,
walletName: wallet.name,
```

`CreateSettlementPage` renders a `<select>` populated from `const { wallets } = useWallets()`.

### Migration Path for People Ledger

1. `CreateSettlementInput.walletId` → `paymentSourceId`
2. `personService.createSettlement()` calls `paymentSourceService.getById()` instead of `walletService.getById()`
3. `CreateSettlementPage` calls `usePaymentSources()` instead of `useWallets()`
4. `TransactionRecord` fields inside `createSettlement()` update from `walletId`/`walletName` → `paymentSourceId`/`paymentSourceName`

**Impact Rating: LOW** — isolated to one service method and one page. Clean boundary.

---

## I. Recurring Commitments Integration Boundary

Recurring Commitments use Wallets in two places:

**1. `commitmentService.create()` — denormalizes wallet name:**
```typescript
const wallet = await walletService.getById(input.defaultWalletId);
walletName = wallet?.name ?? null;
// stored in RecurringCommitmentRecord.defaultWalletName
```

**2. `commitmentService.markPaid()` — selects payment wallet, creates expense transaction:**
```typescript
const wallet = await walletService.getById(input.walletId);
walletId: input.walletId,
walletName: wallet.name,
```

`RecurringCommitmentRecord` has:
- `defaultWalletId: string | null`
- `defaultWalletName: string | null`

`CommitmentForm` and `CommitmentDetailsPage` both call `useWallets()`.

### Migration Path for Commitments

1. `RecurringCommitmentRecord.defaultWalletId` → `defaultPaymentSourceId`
2. `RecurringCommitmentRecord.defaultWalletName` → `defaultPaymentSourceName`
3. `RecordCommitmentPaymentInput.walletId` → `paymentSourceId`
4. `commitmentService` calls `paymentSourceService.getById()` instead of `walletService.getById()`
5. `CommitmentForm` and `CommitmentDetailsPage` call `usePaymentSources()` instead of `useWallets()`

**Impact Rating: LOW-MEDIUM** — type field renames plus hook/service call swaps. No logic changes.

---

## J. UI Migration Plan (Pages, Routes, Components)

### Pages That Must Change

| Page | Change Required |
|---|---|
| `WalletListPage.tsx` | Rename to `PaymentSourceListPage.tsx`; update title keys, breadcrumbs, route constants |
| `WalletDetailsPage.tsx` | Rename to `PaymentSourceDetailsPage.tsx`; update balance display section |
| `CreateWalletPage.tsx` | Rename to `CreatePaymentSourcePage.tsx` |
| `EditWalletPage.tsx` | Rename to `EditPaymentSourcePage.tsx` |
| `StepWallet.tsx` (expense) | Rename to `StepPaymentSource.tsx`; update label, use new hook |
| `StepWallet.tsx` (revenue) | Same |
| `CommitmentForm.tsx` | Update wallet dropdown label, switch hook |
| `CommitmentDetailsPage.tsx` | Update wallet display section, switch hook |
| `CreateSettlementPage.tsx` | Update wallet dropdown label, switch hook |
| `TransactionFiltersBar.tsx` | Rename "Wallet" filter label |
| `CreateTransactionPage.tsx` | Update wallet options source |

### Route Constants to Change

| Old Constant | New Constant |
|---|---|
| `WALLETS` | `PAYMENT_SOURCES` |
| `WALLETS_NEW` | `PAYMENT_SOURCES_NEW` |
| `WALLET_DETAILS` | `PAYMENT_SOURCE_DETAILS` |
| `WALLET_EDIT` | `PAYMENT_SOURCE_EDIT` |

Route paths: `/finance/wallets/*` → `/finance/payment-sources/*`

**Add 301 redirects** for old wallet routes to avoid broken bookmarks.

### Navigation

Sidebar navigation entry "Wallets" → "Payment Sources". i18n key `nav.wallets` → `nav.paymentSources`.

### Components to Rename

| Old | New |
|---|---|
| `WalletCard.tsx` | `PaymentSourceCard.tsx` |
| `WalletFiltersBar.tsx` | `PaymentSourceFiltersBar.tsx` |
| `WalletActionsMenu.tsx` | `PaymentSourceActionsMenu.tsx` |
| `WalletStatusBadge.tsx` | `PaymentSourceStatusBadge.tsx` |
| `WalletTypeBadge.tsx` | `PaymentSourceTypeBadge.tsx` |
| `CreateWalletForm.tsx` | `CreatePaymentSourceForm.tsx` |
| `EditWalletForm.tsx` | `EditPaymentSourceForm.tsx` |

---

## K. State Management Migration

### Zustand Store to Rename

`walletStore.ts` → `paymentSourceStore.ts`

Changes:
- Devtools name: `{ name: 'WalletStore' }` → `{ name: 'PaymentSourceStore' }`
- `WalletFilters` → `PaymentSourceFilters`
- `filters.type: WalletType | ''` → `filters.type: PaymentSourceType | ''`
- `useWalletStore` → `usePaymentSourceStore`

### React Query Keys

`WALLETS_QUERY_KEY = ['wallets']` → `['payment-sources']`

Changing the query key invalidates all cached wallet data in existing client sessions. This is intentional — no additional cleanup needed.

### Hooks to Rename

| Old | New |
|---|---|
| `useWallets()` → returns `{ wallets }` | `usePaymentSources()` → returns `{ paymentSources }` |
| `useWallet(id)` → returns `{ wallet }` | `usePaymentSource(id)` → returns `{ paymentSource }` |
| `useCreateWallet()` | `useCreatePaymentSource()` |
| `useEditWallet()` | `useEditPaymentSource()` |
| `useWalletActions()` | `usePaymentSourceActions()` |

All 6+ hook call sites listed in Section A must update their import and destructuring.

---

## L. Export Migration

### Files to Update

| File | Change |
|---|---|
| `walletExportColumns.ts` | Rename to `paymentSourceExportColumns.ts`; function `getWalletExportColumns()` → `getPaymentSourceExportColumns()` |
| Column header `t('export.columns.walletType')` | → `t('export.columns.paymentSourceType')` |
| Column header `t('wallet.type_${r.type}')` | → `t('paymentSource.type_${r.type}')` |
| `WalletListPage` export handler | Switch to `getPaymentSourceExportColumns()` |

### i18n Keys to Add

```typescript
// en.ts — export namespace
export: {
  columns: {
    paymentSource: 'Payment Source',
    paymentSourceType: 'Payment Source Type',
  }
}
```

---

## M. Dashboard/Reports Impact

### Current State

No wallet balance widget exists on the dashboard. The reports module (Phase 5) is not yet implemented. There are no balance chart or cash-flow report components.

### Impact on Future Work

The report architecture (`ILedgerService`, `ICashFlowCalculator`) references `walletId` throughout. If the refactor happens before Phase 5, report development starts clean. If it happens after, the report code needs updating too.

**Recommendation: Execute the refactor before Phase 5 (Reports) is implemented** to avoid double migration.

---

## N. Data Migration Plan (Step-by-Step)

The current implementation is fully in-memory. The plan below is written for the future Firestore production scenario.

### Phase N-1: Pre-Migration (No Code Changes)

- Freeze new Wallet-related code changes
- Document every Firestore collection path that uses `walletId` as a field
- Take a full Firestore export backup

### Phase N-2: Add `paymentSourceId` Alongside `walletId` (Dual-Write)

- Deploy a service version that writes **both** `walletId` and `paymentSourceId` on all new transactions
- `paymentSourceId` starts as a copy of `walletId`
- Do not delete `walletId` yet
- Existing reads still use `walletId`; new reads can use either

### Phase N-3: Backfill Migration Script

```
for each transaction in companies/{companyId}/transactions:
  if paymentSourceId is null:
    set paymentSourceId = walletId
    set paymentSourceName = walletName
```

Run in batches of 500 (Firestore batch limit). Validate: count documents where `paymentSourceId is null` = 0.

### Phase N-4: Rename Wallet Collection → PaymentSource Collection

- Create new Firestore collection: `companies/{companyId}/paymentSources`
- Copy all documents from `wallets` → `paymentSources`
- Update Firebase Security Rules to grant access to `paymentSources`
- Keep `wallets` collection read-only (write-blocked) during transition

### Phase N-5: Switch Reads and Writes to paymentSources

- Deploy code that reads from and writes to `paymentSources`
- Stop writing to `wallets` collection
- Monitor for 48 hours
- If stable, archive `wallets` collection (do not delete — soft-delete principle)

### Rollback Plan

At any phase, rollback by reverting the code deploy and switching reads back to `walletId`. The dual-write period (Phase N-2) ensures rollback is safe.

---

## O. Risks

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| O-1 | Currency coupling breaks | HIGH | MEDIUM | Payment Sources must retain a `currency` field. If decoupled, the expense/revenue StepWallet currency-auto-select breaks and needs a new UX flow. |
| O-2 | WalletType → PaymentSourceType semantic mismatch | MEDIUM | LOW | `WalletType.Partner` is semantically wrong in a payment-source model. Should be renamed to `PartnerAccount`. |
| O-3 | CurrencyCode re-export chain breaks | MEDIUM | MEDIUM | `CurrencyCode` is defined in `wallet.types.ts` and re-exported from `transaction.types.ts`. Moving the module breaks this chain. Must promote `CurrencyCode` to `shared/types/currency.ts`. |
| O-4 | Missed `walletId` in filter objects | MEDIUM | HIGH | `TransactionFilters.walletId` is used in filter logic. If renamed and any persisted filter state exists (Zustand, URL params), it breaks silently. |
| O-5 | `wallet.type_*` i18n keys scattered | LOW | HIGH | Over 20 i18n translation keys use `wallet.type_*`, `wallet.status_*`. Missing any causes raw key display in UI. Must grep all usages. |
| O-6 | Export column file leaves stale references | LOW | LOW | TypeScript will catch import mismatches at build time. |
| O-7 | Transfer transaction type name confusion | LOW | LOW | `TransactionType.Transfer` already doesn't say "Wallet" in its value. No change needed. |
| O-8 | WALLETS route path hardcoded in breadcrumbs | LOW | MEDIUM | Several pages use `ROUTE_PATHS.WALLETS` in breadcrumb `setItems()`. Must grep all breadcrumb usages and update. |

---

## P. Breaking Changes

### P-1: Import Path Changes (Compile-Time — TypeScript catches all)

```typescript
// Before
import { WalletRecord } from '@/features/finance/wallets/types/wallet.types';
import { useWallets } from '@/features/finance/wallets/hooks/useWallets';
import { walletService } from '@/features/finance/wallets/services/walletService';

// After
import { PaymentSourceRecord } from '@/features/finance/payment-sources/types/paymentSource.types';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { paymentSourceService } from '@/features/finance/payment-sources/services/paymentSourceService';
```

TypeScript will surface every import break at build time. Zero silent failures.

### P-2: CurrencyCode Source of Truth (Compile-Time)

`CurrencyCode` currently lives in `wallet.types.ts`. Moving the module means this type must move to `src/shared/types/currency.ts`. Files that import `CurrencyCode` via `transaction.types.ts` (which re-exports it) are safe only if `transaction.types.ts` updates its re-export source. Files that import directly from `wallet.types.ts` break immediately.

**Affected files:** `commitmentService.ts`, `personService.ts`, `StepReview.tsx` (expense), `CreateWalletForm.tsx`.

### P-3: Route Path Changes (Runtime — NOT caught by TypeScript)

`ROUTE_PATHS.WALLETS = '/finance/wallets'` → `ROUTE_PATHS.PAYMENT_SOURCES = '/finance/payment-sources'`

Any bookmarks or shared links pointing to `/finance/wallets/*` will 404 after migration unless 301 redirects are added.

### P-4: `TransactionRecord.walletId` Field Name (Data Contract)

The most impactful breaking change. Any code reading `transaction.walletId` by string key (e.g., dynamic access, serialized filter objects in localStorage) breaks silently at runtime. TypeScript static access (`transaction.walletId`) is caught at compile time.

### P-5: `useWallets()` Return Shape (Compile-Time)

Any consumer that destructures `const { wallets } = useWallets()` after the hook is renamed must update the destructuring. TypeScript catches this because the return type changes.

### P-6: i18n Key Renames (Runtime — NOT caught by TypeScript)

Any `t('wallet.type_Bank')` key that is not updated will display the raw key string in the UI. No TypeScript protection. Must use grep + manual verification.

---

## Q. Recommended Final Architecture

### Q-1: The PaymentSourceRecord Shape

```typescript
// src/features/finance/payment-sources/types/paymentSource.types.ts

export type PaymentSourceType =
  | 'BankAccount'
  | 'Cash'
  | 'PettyCash'
  | 'CreditCard'
  | 'DigitalWallet'
  | 'Investment'
  | 'PartnerAccount';

export interface PaymentSourceRecord {
  id: string;
  code: string;
  name: string;
  type: PaymentSourceType;
  currency: CurrencyCode;      // MUST stay — drives transaction currency auto-select
  description: string;
  openingBalance: number;
  openingBalanceDate: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

**Key decision: `currency` stays on PaymentSource.** Without it, every expense/revenue form needs an extra manual currency selection step.

### Q-2: CurrencyCode Promotion

Move `CurrencyCode` from `wallet.types.ts` to `src/shared/types/currency.ts`:

```typescript
// src/shared/types/currency.ts
export type CurrencyCode = 'EGP' | 'USD' | 'EUR' | 'SAR' | 'AED';
```

This is the correct location per the type ownership rule in the system architecture: "Type used by multiple features → `src/shared/types/`." `CurrencyCode` is used by 4 feature slices.

### Q-3: TransactionRecord Field Names

```typescript
// Rename fields in TransactionRecord:
paymentSourceId: string;                      // was walletId
paymentSourceName: string;                    // was walletName
destinationPaymentSourceId: string | null;    // was destinationWalletId
destinationPaymentSourceName: string | null;  // was destinationWalletName

// Rename in TransactionFilters:
paymentSourceId: string;                      // was walletId
```

### Q-4: Keep PaymentMethod As-Is

Do not merge `PaymentMethod` into `PaymentSource`. They answer different questions:

- "Which account was debited/credited?" → PaymentSource
- "Was it a card swipe or a wire transfer?" → PaymentMethod

Both are independently useful for reporting and filtering.

### Q-5: Recommended Folder Structure

```
src/features/finance/
  payment-sources/              ← renamed from wallets/
    types/
      paymentSource.types.ts
    services/
      paymentSourceService.ts
    store/
      paymentSourceStore.ts
    hooks/
      usePaymentSources.ts
      usePaymentSource.ts
      useCreatePaymentSource.ts
      useEditPaymentSource.ts
      usePaymentSourceActions.ts
    validation/
      paymentSource.schema.ts
    export/
      paymentSourceExportColumns.ts
    components/
      PaymentSourceCard.tsx
      PaymentSourceFiltersBar.tsx
      PaymentSourceActionsMenu.tsx
      PaymentSourceStatusBadge.tsx
      PaymentSourceTypeBadge.tsx
      CreatePaymentSourceForm.tsx
      EditPaymentSourceForm.tsx
    pages/
      PaymentSourceListPage.tsx
      PaymentSourceDetailsPage.tsx
      CreatePaymentSourcePage.tsx
      EditPaymentSourcePage.tsx
    index.ts
```

### Q-6: Recommended Implementation Sequence

1. **Promote `CurrencyCode` to `shared/types/currency.ts`** — zero visible change, fixes the root import issue
2. **Create the new `payment-sources/` module** alongside the existing `wallets/` module (do not delete yet)
3. **Update `TransactionRecord`** to use `paymentSourceId`/`paymentSourceName` — cascades to all services
4. **Update `commitmentService` and `personService`** to import from payment-sources
5. **Update all hooks and pages** to use `usePaymentSources()`
6. **Update `ROUTE_PATHS` constants** and add 301 redirects for old wallet routes
7. **Update i18n files** — all `wallet.*` keys in forms, filters, and navigation
8. **Delete `wallets/` module** — only after all consumers are migrated and build passes with zero TS errors

---

## ADR-005: Payment Sources over Wallet (PROPOSED)

**Status:** PROPOSED  
**Date:** 2026-08-13

---

### Context

The current `Wallet` module uses the term "Wallet" to describe a generic money container (bank accounts, cash, petty cash, digital wallets). As the system has grown, several problems with this naming have emerged:

1. The word "Wallet" implies a digital payment instrument (Apple Pay, etc.), which is confusing for bank accounts and cash drawers.
2. The `PaymentMethod` enum already exists as a separate concept for HOW money moves. "Wallet" gets conflated with "payment method" by users and developers.
3. New modules (Recurring Commitments, People Ledger) reference "Wallet" as the settlement account, spreading the semantic confusion.
4. The `CurrencyCode` type is defined inside `wallet.types.ts` but consumed by 4 feature slices — it belongs in `shared/types/`.

### Decision

Rename the Wallet module to Payment Sources throughout the codebase:

1. `WalletRecord` → `PaymentSourceRecord`
2. `wallets/` folder → `payment-sources/` folder
3. `walletId` / `walletName` in `TransactionRecord` → `paymentSourceId` / `paymentSourceName`
4. `ROUTE_PATHS.WALLETS` → `ROUTE_PATHS.PAYMENT_SOURCES`; add redirects from old paths
5. `CurrencyCode` promoted to `src/shared/types/currency.ts`
6. `PaymentMethod` enum remains unchanged (separate concept — the HOW not the WHERE)
7. Payment Sources retain the `currency` field — it is not decoupled

### Consequences

**Positive:**
- Naming aligns with what the entities actually represent
- `CurrencyCode` is in the correct shared location per the type ownership rule
- Eliminates user and developer confusion between "Wallet" (payment instrument) and "account"
- All new modules (Reports, Salary, Loans) start with correct naming from day one

**Negative:**
- Cross-cutting rename affecting 12+ files and 2 new modules (Commitments, People Ledger)
- Route path changes require 301 redirects to avoid broken links
- All i18n `wallet.*` translation keys must be audited and migrated
- One sprint of migration work with no visible user-facing feature value

**Rejected Alternative:** Keeping the "Wallet" name.

Rejected because the semantic gap will grow as more modules reference `walletId`. Fixing it after the ASP.NET Core backend migration (Phase 10) would require database schema changes in addition to code changes, making the refactor significantly more expensive.

---

**END OF REPORT**

*This document is the sole deliverable of Phase 18A. No application code was modified during its preparation. Implementation requires explicit approval before any code changes begin.*
