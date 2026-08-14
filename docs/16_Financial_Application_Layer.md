# Financial Application Layer — Architecture

**Phase:** 15  
**Status:** Contracts Complete — Awaiting Implementation Review  
**Location:** `src/features/finance/application/`

---

## Folder Tree

```
src/features/finance/application/
├── commands/
│   ├── TransactionCommands.ts     — 8 typed command interfaces
│   └── WalletCommands.ts          — 3 typed command interfaces
├── queries/
│   ├── TransactionQueries.ts      — 2 queries + DTOs
│   └── WalletQueries.ts           — 5 queries + DTOs
├── use-cases/
│   ├── ITransactionUseCases.ts    — 10 use case interfaces
│   └── IWalletUseCases.ts         — 8 use case interfaces
├── results/
│   └── AppResult.ts               — Result<T> + helpers
├── validators/
│   ├── TransactionValidator.ts    — Cross-entity validation rules
│   └── WalletValidator.ts         — Wallet-specific validation rules
├── mappers/
│   ├── TransactionMapper.ts       — Command → Domain → DTO
│   └── WalletMapper.ts            — Command → Domain → DTO
└── index.ts                       — Barrel export
```

---

## Application Flow

```
UI / Hook
    │
    ▼  (Command or Query)
Use Case Interface  ◀── Satisfied by concrete implementation (in-memory / API)
    │
    ├── Validator      ← cross-entity rules (wallet exists? partner exists?)
    ├── Workflow       ← IWorkflowService (state transition guard)
    ├── Service        ← walletService / transactionService (persistence)
    └── Mapper         ← Command → Record → DTO
    │
    ▼  (AppResult<T>)
UI / Hook
```

---

## Command Inventory

### Transaction Commands (8)

| Command | Description |
|---------|-------------|
| `CreateTransactionCommand` | New Draft transaction with all fields |
| `UpdateTransactionCommand` | Patch a Draft transaction |
| `SubmitTransactionCommand` | Draft → Submitted |
| `ApproveTransactionCommand` | Submitted → Approved |
| `RejectTransactionCommand` | Submitted/Approved → Rejected (reason required) |
| `CancelTransactionCommand` | Draft/Submitted/Approved → Cancelled (reason required) |
| `ReverseTransactionCommand` | Posted/Completed → Reversed (creates new transaction) |
| `DuplicateTransactionCommand` | Any → new Draft copy |

### Wallet Commands (3)

| Command | Description |
|---------|-------------|
| `CreateWalletCommand` | New wallet with optional opening balance |
| `UpdateWalletCommand` | Patch name/description/code (no currency change) |
| `ArchiveWalletCommand` | Mark wallet archived (zero balance enforced) |

---

## Query Inventory

### Transaction Queries (2)

| Query | Returns |
|-------|---------|
| `GetTransactionByIdQuery` | `TransactionDTO` |
| `GetTransactionListQuery` | `TransactionListDTO` (paginated, filterable) |

### Wallet Queries (5)

| Query | Returns |
|-------|---------|
| `GetWalletByIdQuery` | `WalletDTO` |
| `GetWalletListQuery` | `WalletDTO[]` |
| `GetWalletBalanceQuery` | `WalletBalanceDTO` (point-in-time balance) |
| `GetCashFlowQuery` | `CashFlowPeriodDTO[]` (inflow/outflow by period) |
| `GetFinancialSummaryQuery` | `FinancialSummaryDTO` (totals for date range) |

---

## Use Case Inventory

### Transaction (10)

`ICreateTransactionUseCase` · `IUpdateTransactionUseCase` · `ISubmitTransactionUseCase` · `IApproveTransactionUseCase` · `IRejectTransactionUseCase` · `ICancelTransactionUseCase` · `IReverseTransactionUseCase` · `IDuplicateTransactionUseCase` · `IGetTransactionByIdUseCase` · `IGetTransactionListUseCase`

### Wallet (8)

`ICreateWalletUseCase` · `IUpdateWalletUseCase` · `IArchiveWalletUseCase` · `IGetWalletByIdUseCase` · `IGetWalletListUseCase` · `IGetWalletBalanceUseCase` · `IGetCashFlowUseCase` · `IGetFinancialSummaryUseCase`

---

## Result Pattern

```typescript
type AppResult<T> =
  | { success: true;  data: T; warnings?: AppWarning[]; metadata?: Record<string, unknown> }
  | { success: false; error: AppError; validationErrors?: ValidationError[] }
```

Use cases never throw. Every call site does:
```typescript
const result = await useCase.execute(cmd);
if (!result.success) { /* handle error */ return; }
// result.data is now safely typed as T
```

---

## Validator Rules

### Transaction Validators
- Wallet must exist
- Transfer: destination wallet required, must differ from source
- Partner contribution: partnerId required
- Partner/category IDs must resolve to existing records
- Amount must be > 0
- Update: only Draft transactions are editable
- Workflow transition must be allowed by `WorkflowTransitions`

### Wallet Validators
- Code must be unique
- Opening balance ≥ 0
- Opening balance > 0 requires a date
- Update: wallet must exist

---

## Dependency Rule

Application layer imports **only**:
- `domain/` — enums, workflow contracts
- Service interfaces (not implementations)
- Mappers and validators within this layer

Application layer **never** imports:
- React
- Zustand  
- UI components
- Pages
- shadcn/ui

---

## Architectural Observations

1. **Validators receive a context object** supplied by the use case from service lookups — they do not call services themselves, keeping them pure functions.

2. **Mappers are pure functions** — no side effects, no async. They transform shapes between layers.

3. **The `_type` discriminant** on every command enables exhaustive switch dispatch in future orchestrators without runtime overhead.

4. **`GetWalletBalanceQuery.asOf`** enables point-in-time balance reporting by replaying transactions up to a date — this is the Transaction Engine Principle in practice.

5. **`GetCashFlowQuery.groupBy`** is deliberately coarse (day/week/month) — sub-day granularity belongs in a reporting/analytics phase, not here.

6. **Reversal uses `correlationId`** to chain the original and reversing transactions in the audit trail, enabling full traceability without modifying the original record.
