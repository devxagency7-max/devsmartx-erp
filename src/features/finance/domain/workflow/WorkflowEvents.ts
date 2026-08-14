import { WorkflowState } from '../enums/WorkflowState';

/**
 * Domain event placeholders for the Financial Workflow Engine.
 * Events are reserved for a future notification / integration layer.
 * No implementation here — contracts only.
 */

export interface WorkflowEventBase {
  readonly _event: string;
  readonly transactionId: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly occurredAt: string;       // ISO 8601 UTC
}

export interface TransactionSubmittedEvent extends WorkflowEventBase {
  readonly _event: 'TransactionSubmitted';
  readonly fromState: WorkflowState.Draft;
  readonly toState: WorkflowState.Submitted;
}

export interface TransactionApprovedEvent extends WorkflowEventBase {
  readonly _event: 'TransactionApproved';
  readonly fromState: WorkflowState.Submitted;
  readonly toState: WorkflowState.Approved;
}

export interface TransactionPostedEvent extends WorkflowEventBase {
  readonly _event: 'TransactionPosted';
  readonly fromState: WorkflowState.Approved;
  readonly toState: WorkflowState.Posted;
}

export interface TransactionCompletedEvent extends WorkflowEventBase {
  readonly _event: 'TransactionCompleted';
  readonly fromState: WorkflowState.Posted;
  readonly toState: WorkflowState.Completed;
}

export interface TransactionCancelledEvent extends WorkflowEventBase {
  readonly _event: 'TransactionCancelled';
  readonly reason: string;
}

export interface TransactionReversedEvent extends WorkflowEventBase {
  readonly _event: 'TransactionReversed';
  readonly reversingTransactionId: string;
  readonly reason: string;
}

export type WorkflowEvent =
  | TransactionSubmittedEvent
  | TransactionApprovedEvent
  | TransactionPostedEvent
  | TransactionCompletedEvent
  | TransactionCancelledEvent
  | TransactionReversedEvent;
