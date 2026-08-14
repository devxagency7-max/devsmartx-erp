# Phase 18 — Financial Obligations & People Ledger

## Overview

This phase adds two new business capabilities to the DevSmartX ERP Finance module:

1. **Recurring Financial Commitments** — track, manage, and pay recurring obligations (rent, subscriptions, salaries)
2. **People Ledger** — track bilateral financial relationships with individuals (employees, contractors, partners)

Both modules integrate with the existing Transaction Engine. No second financial engine was created.

---

## Part A — Recurring Financial Commitments

### Location
`src/features/finance/commitments/`

### Domain Model: `RecurringCommitmentRecord`

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| code | string | `CMT-YYYYMMDD-XXXXX` |
| name | string | Display name |
| description | string | Optional description |
| categoryId | string\|null | Linked expense category |
| defaultWalletId | string\|null | Default wallet for payments |
| defaultPaymentMethodId | string\|null | Default payment method |
| amount | number | Expected payment amount |
| currency | string | ISO currency code |
| frequency | `CommitmentFrequency` | Weekly/Monthly/Quarterly/SemiAnnual/Yearly/Custom |
| startDate | string | ISO date |
| nextDueDate | string | ISO date — auto-advanced on payment |
| endDate | string\|null | Optional end date |
| status | `CommitmentStatus` | Active/Paused/Completed/Cancelled/Expired |
| vendorName | string | Payee name |
| relatedProjectId | string\|null | Future: Project Management hook |
| notes | string | Free-text notes |
| createdAt / updatedAt | string | ISO timestamps |

### Due Windows (computed, not stored)

| Window | Logic |
|---|---|
| Overdue | `nextDueDate < today` |
| DueToday | `nextDueDate == today` |
| DueSoon | `0 < days_remaining <= 7` |
| Upcoming | `days_remaining > 7` |
| Paid | Derived when status is not Active |

Configurable via `DUE_SOON_DAYS` constant in `commitment.types.ts`.

### CommitmentPayment Model

| Field | Type | Description |
|---|---|---|
| id | string | `cpay-XXX` |
| commitmentId | string | Parent commitment |
| transactionId | string\|null | Linked Expense transaction |
| amount | number | Amount actually paid |
| currency | string | Currency paid in |
| paidAt | string | Payment date |
| status | Paid\|Partial\|Overpaid | Auto-detected from amount vs expected |
| notes | string | Notes |

### Mark Paid Flow

`commitmentService.markPaid()`:
1. Validates commitment and wallet exist
2. Creates a `TransactionStatus.Completed` Expense transaction via `transactionService.createFromRecord()`
3. Records the `CommitmentPaymentRecord`
4. Advances `nextDueDate` by one frequency interval
5. Sets status to `Expired` if new nextDueDate > endDate

This ensures the Transaction Engine remains the single source of truth.

### Pages

| Route | Page |
|---|---|
| `/finance/commitments` | RecurringCommitmentsListPage |
| `/finance/commitments/new` | CreateCommitmentPage |
| `/finance/commitments/:id` | CommitmentDetailsPage |
| `/finance/commitments/:id/edit` | EditCommitmentPage |

### Export

Column file: `src/features/finance/commitments/export/commitmentExportColumns.ts`

Columns: code, name, vendor, amount, currency, frequency, status, nextDueDate, startDate, endDate, category, notes, createdAt

---

## Part B — People Ledger

### Location
`src/features/finance/people/`

### Domain Model: `PersonRecord`

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| code | string | `PRS-YYYYMMDD-XXXXX` |
| name | string | Full name |
| email | string\|null | Optional email |
| phone | string\|null | Optional phone |
| type | `PersonType` | Partner/Employee/Contractor/SupplierContact/Other |
| status | `PersonStatus` | Active/Inactive/Archived |
| notes | string | Free-text notes |
| createdAt / updatedAt | string | ISO timestamps |

### Ledger Entry Model: `PersonLedgerEntry`

| Field | Type | Description |
|---|---|---|
| id | string | `ple-XXX` |
| personId | string | Parent person |
| direction | `LedgerDirection` | PERSON_OWES_COMPANY or COMPANY_OWES_PERSON |
| amount | number | Entry amount |
| currency | string | ISO currency code |
| reason | string | Description of the obligation |
| categoryId | string\|null | Optional category |
| transactionId | string\|null | Linked financial transaction (settlements only) |
| relatedProjectId | string\|null | Future: Project Management hook |
| reference | string | `PLE-YYYYMMDD-XXXXX` |
| date | string | Entry date |
| status | `LedgerEntryStatus` | Pending/Settled/Cancelled |
| notes | string | Notes |

### Balance Derivation

**Balances are NEVER stored.** They are always derived on demand:

```ts
derivePersonBalances(entries: PersonLedgerEntry[]): PersonBalance[]
```

- Groups entries by currency (multi-currency, never combined)
- `PERSON_OWES_COMPANY` adds to net; `COMPANY_OWES_PERSON` subtracts from net
- Positive net → person owes company; negative net → company owes person
- Zero → Settled

### Settlement Flow

`personService.createSettlement()`:

| Settlement Direction | Transaction Type | Interpretation |
|---|---|---|
| PERSON_OWES_COMPANY | Revenue | Person pays back → company receives money |
| COMPANY_OWES_PERSON | Expense | Company pays person → money goes out |

The settlement creates:
1. A real `TransactionStatus.Completed` transaction via `transactionService.createFromRecord()`
2. A `PersonLedgerEntry` with `status: Settled` and `transactionId` linked

### Directional UI Labels

Arabic:
- `PERSON_OWES_COMPANY` → "عليه للشركة"  
- `COMPANY_OWES_PERSON` → "للشركة عليه"

English:
- `PERSON_OWES_COMPANY` → "Person owes company"
- `COMPANY_OWES_PERSON` → "Company owes person"

### Pages

| Route | Page |
|---|---|
| `/finance/people` | PeopleListPage |
| `/finance/people/new` | CreatePersonPage |
| `/finance/people/:id` | PersonDetailsPage |
| `/finance/people/:id/edit` | EditPersonPage |
| `/finance/people/:id/ledger` | PersonLedgerPage |
| `/finance/people/:id/settlement` | CreateSettlementPage |

### Export

- Person list: `src/features/finance/people/export/personExportColumns.ts`
- Ledger entries: `src/features/finance/people/export/ledgerExportColumns.ts`

---

## Transaction Engine Integration

Both modules create financial transactions exclusively through the existing transaction engine:

- **Commitment payments** → `Expense` transaction (`EXP-YYYYMMDD-XXXXX`)
- **Person settlements (person pays company)** → `Revenue` transaction (`REV-YYYYMMDD-XXXXX`)
- **Person settlements (company pays person)** → `Expense` transaction (`EXP-YYYYMMDD-XXXXX`)

`transactionService.createFromRecord()` is used to persist pre-built `TransactionRecord` objects, preserving all existing posting rules and status lifecycle.

---

## Placeholder Interfaces (NOT Implemented)

### Notification Interface
Both `commitmentService` and `personService` are designed for future notification integration:
- Overdue commitments → push notification
- New ledger entries → Slack/email alert

Placeholder: notifications are surfaced via `react-hot-toast` toasts at the UI layer only.

### Dashboard Widget Interface
Data interfaces for future dashboard widgets:
- "Commitments due this week" summary card
- "Outstanding person balances" summary card

These can be added as dashboard quick-action items reading from `commitmentService.getAll()` and `personService.getLedgerBalances()`.

---

## relatedProjectId

Both `RecurringCommitmentRecord` and `PersonLedgerEntry` include `relatedProjectId: string | null`.

This field is stored and preserved but the Project Management module is NOT implemented in this phase. When Project Management ships, commitments and ledger entries can be linked to projects without a schema migration.

---

## File Structure

```
src/features/finance/commitments/
  types/commitment.types.ts
  utils/commitmentHelpers.ts
  services/commitmentService.ts
  store/commitmentStore.ts
  hooks/useCommitments.ts
  validation/commitment.schema.ts
  export/commitmentExportColumns.ts
  components/CommitmentForm.tsx
  pages/
    RecurringCommitmentsListPage.tsx
    CreateCommitmentPage.tsx
    CommitmentDetailsPage.tsx
    EditCommitmentPage.tsx

src/features/finance/people/
  types/person.types.ts
  utils/personHelpers.ts
  services/personService.ts
  store/personStore.ts
  hooks/usePeople.ts
  validation/person.schema.ts
  export/
    personExportColumns.ts
    ledgerExportColumns.ts
  components/PersonForm.tsx
  pages/
    PeopleListPage.tsx
    CreatePersonPage.tsx
    PersonDetailsPage.tsx
    EditPersonPage.tsx
    PersonLedgerPage.tsx
    CreateSettlementPage.tsx
```

---

## i18n Keys Added

- `src/shared/i18n/locales/en.ts` — `commitment.*` and `person.*` namespaces
- `src/shared/i18n/locales/ar.ts` — matching Arabic translations

---

## Routes Added

Constants in `src/app/router/constants.ts`:
```
COMMITMENTS, COMMITMENTS_NEW, COMMITMENT_DETAILS, COMMITMENT_EDIT
PEOPLE, PEOPLE_NEW, PERSON_DETAILS, PERSON_EDIT, PERSON_LEDGER, PERSON_SETTLEMENT
```

Lazy-loaded entries in `src/app/router/routes.ts`.
