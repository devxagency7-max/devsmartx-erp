import { WorkflowState } from '../enums/WorkflowState';

/**
 * Defines the legal state transitions for the Financial Workflow Engine.
 * Key = current state. Value = set of states that can be transitioned to.
 */
export const WORKFLOW_TRANSITIONS: Readonly<Record<WorkflowState, ReadonlySet<WorkflowState>>> = {
  [WorkflowState.Draft]: new Set([
    WorkflowState.Submitted,
    WorkflowState.Cancelled,
  ]),
  [WorkflowState.Submitted]: new Set([
    WorkflowState.Approved,
    WorkflowState.Rejected,
    WorkflowState.Cancelled,
  ]),
  [WorkflowState.Approved]: new Set([
    WorkflowState.Posted,
    WorkflowState.Rejected,
    WorkflowState.Cancelled,
  ]),
  [WorkflowState.Posted]: new Set([
    WorkflowState.Completed,
    WorkflowState.Reversed,
  ]),
  [WorkflowState.Completed]: new Set([
    WorkflowState.Reversed,
  ]),
  [WorkflowState.Cancelled]: new Set(),
  [WorkflowState.Rejected]:  new Set(),
  [WorkflowState.Reversed]:  new Set(),
};

/** Returns true if the transition from `current` to `next` is legal. */
export function isTransitionAllowed(current: WorkflowState, next: WorkflowState): boolean {
  return WORKFLOW_TRANSITIONS[current].has(next);
}

/** Returns whether the given state is terminal (no further transitions allowed). */
export function isTerminalState(state: WorkflowState): boolean {
  return WORKFLOW_TRANSITIONS[state].size === 0;
}

/** Returns whether the transaction is editable in the given state. */
export function isEditableState(state: WorkflowState): boolean {
  return state === WorkflowState.Draft;
}

/** Returns whether the transaction affects balances/ledger in the given state. */
export function affectsBalances(state: WorkflowState): boolean {
  return state === WorkflowState.Posted || state === WorkflowState.Completed || state === WorkflowState.Reversed;
}
