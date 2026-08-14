# Financial Workflow Engine — Architecture

**Phase:** 14  
**Status:** Contracts Complete — Awaiting Implementation Review  
**Location:** `src/features/finance/domain/workflow/`

---

## State Diagram

```
              ┌─────────────────────────────────────────┐
              │                                         │
   ┌───────┐  │  ┌───────────┐  ┌──────────┐  ┌──────┐ │  ┌───────────┐
   │ Draft │──┼─▶│ Submitted │─▶│ Approved │─▶│Posted│─┼─▶│ Completed │
   └───────┘  │  └───────────┘  └──────────┘  └──────┘ │  └───────────┘
       │       │        │              │           │     │        │
       │       │        ▼              ▼           ▼     │        ▼
       │       │    ┌────────┐    ┌────────┐  ┌────────┐│   ┌──────────┐
       └───────┼──▶ │Rejected│    │Rejected│  │Reversed││   │ Reversed │
               │    └────────┘    └────────┘  └────────┘│   └──────────┘
               │        │                               │
               │        ▼                               │
               │   ┌──────────┐                         │
               └──▶│Cancelled │◀────────────────────────┘
                   └──────────┘
```

---

## Lifecycle Rules

| State     | Editable | Affects Balances | Terminal |
|-----------|----------|-----------------|----------|
| Draft     | ✓        | ✗               | ✗        |
| Submitted | ✗        | ✗               | ✗        |
| Approved  | ✗        | ✗               | ✗        |
| Posted    | ✗        | ✓               | ✗        |
| Completed | ✗        | ✓               | ✗ (can reverse) |
| Cancelled | ✗        | ✗               | ✓        |
| Rejected  | ✗        | ✗               | ✓        |
| Reversed  | ✗        | ✓ (countered)   | ✓        |

---

## Transition Map

```
Draft      → Submitted | Cancelled
Submitted  → Approved  | Rejected | Cancelled
Approved   → Posted    | Rejected | Cancelled
Posted     → Completed | Reversed
Completed  → Reversed
Cancelled  → (terminal)
Rejected   → (terminal)
Reversed   → (terminal)
```

Source of truth: `WorkflowTransitions.ts`

---

## Commands

| Command                    | From State(s)                  | To State   |
|---------------------------|-------------------------------|------------|
| `SubmitTransaction`       | Draft                          | Submitted  |
| `ApproveTransaction`      | Submitted                      | Approved   |
| `RejectTransaction`       | Submitted, Approved            | Rejected   |
| `PostTransaction`         | Approved                       | Posted     |
| `CompleteTransaction`     | Posted                         | Completed  |
| `CancelTransaction`       | Draft, Submitted, Approved     | Cancelled  |
| `ReverseTransaction`      | Posted, Completed              | Reversed   |
| `DuplicateTransaction`    | Any                            | (new Draft)|

All commands extend `WorkflowCommandBase` requiring `transactionId`, `actorId`, and optional `reason` + `correlationId`.

---

## Result Pattern

Every command returns `WorkflowResult<T>`:

```typescript
type WorkflowResult<T> =
  | { success: true;  data: T }
  | { success: false; error: WorkflowError }
```

Commands never throw. Callers must check `result.success` before consuming `result.data`.

**Error codes:** `INVALID_TRANSITION` | `PERMISSION_DENIED` | `BUSINESS_RULE_VIOLATION` | `TRANSACTION_NOT_FOUND` | `ALREADY_IN_STATE` | `TERMINAL_STATE`

---

## Audit Trail

Every transition records a `WorkflowAuditEntry`:

```typescript
interface WorkflowAuditEntry {
  id, transactionId, fromState, toState,
  actorId, actorName, reason, correlationId, occurredAt
}
```

Written exclusively by the workflow service — never by components or hooks.

---

## Domain Events (Placeholder)

Reserved for a future notification / integration layer:

| Event                       | Trigger                  |
|-----------------------------|--------------------------|
| `TransactionSubmitted`      | Draft → Submitted        |
| `TransactionApproved`       | Submitted → Approved     |
| `TransactionPosted`         | Approved → Posted        |
| `TransactionCompleted`      | Posted → Completed       |
| `TransactionCancelled`      | Any → Cancelled          |
| `TransactionReversed`       | Posted/Completed → Rev.  |

---

## Service Interface

`IWorkflowService` is the single contract all implementations must satisfy:

```typescript
interface IWorkflowService {
  getState(transactionId): Promise<WorkflowResult<WorkflowState>>
  getAuditTrail(transactionId): Promise<WorkflowResult<WorkflowAuditEntry[]>>
  submit(cmd): Promise<WorkflowResult<void>>
  approve(cmd): Promise<WorkflowResult<void>>
  reject(cmd): Promise<WorkflowResult<void>>
  post(cmd): Promise<WorkflowResult<void>>
  complete(cmd): Promise<WorkflowResult<void>>
  cancel(cmd): Promise<WorkflowResult<void>>
  reverse(cmd): Promise<WorkflowResult<{ reversingTransactionId: string }>>
  duplicate(cmd): Promise<WorkflowResult<{ newTransactionId: string }>>
}
```

---

## Enforcement Rules

- The UI layer **must not** perform state transitions directly. All state changes go through `IWorkflowService`.
- The Transaction Engine **must not** set `status` without going through the workflow (once implemented).
- The `isEditableState()` guard must be checked before any form renders editable fields.
- The `affectsBalances()` guard must be checked by the Ledger layer before computing balance reports.
- Reversal **never modifies** the original transaction — it creates a new transaction with mirrored amounts.
- `correlationId` must be propagated through reversal chains to enable full audit reconstruction.

---

## Files Created

| File | Purpose |
|------|---------|
| `domain/enums/WorkflowState.ts` | WorkflowState enum |
| `domain/workflow/WorkflowTransitions.ts` | Transition map + guard helpers |
| `domain/workflow/WorkflowResult.ts` | Result/Error pattern |
| `domain/workflow/WorkflowAudit.ts` | Audit entry interface |
| `domain/workflow/WorkflowCommands.ts` | 8 command interfaces |
| `domain/workflow/WorkflowEvents.ts` | 6 domain event interfaces |
| `domain/workflow/IWorkflowService.ts` | Service contract |
| `domain/workflow/index.ts` | Barrel export |
