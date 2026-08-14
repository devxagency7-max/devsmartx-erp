/**
 * Command interfaces for the Financial Workflow Engine.
 * Each command is the input contract for one workflow operation.
 * Implementations live in the application/use-case layer (not here).
 */

export interface WorkflowCommandBase {
  /** The transaction being acted upon. */
  readonly transactionId: string;
  /** The user performing the action (placeholder — auth layer will supply this). */
  readonly actorId: string;
  /** Optional reason / comment to record in the audit trail. */
  readonly reason?: string;
  /** Correlation ID for linking related operations (e.g. reversal chains). */
  readonly correlationId?: string;
}

/** Move a Draft transaction to Submitted for approval. */
export interface SubmitTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'SubmitTransaction';
}

/** Approve a Submitted transaction, making it ready for posting. */
export interface ApproveTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'ApproveTransaction';
}

/** Reject a Submitted or Approved transaction. */
export interface RejectTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'RejectTransaction';
  readonly reason: string;   // required for rejection
}

/** Post an Approved transaction — creates ledger entries and affects balances. */
export interface PostTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'PostTransaction';
}

/** Mark a Posted transaction as business-complete. */
export interface CompleteTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'CompleteTransaction';
}

/** Cancel a Draft, Submitted, or Approved transaction (before posting). */
export interface CancelTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'CancelTransaction';
  readonly reason: string;   // required for cancellation
}

/**
 * Reverse a Posted or Completed transaction.
 * Never edits the original — always creates a new reversing transaction.
 */
export interface ReverseTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'ReverseTransaction';
  readonly reason: string;   // required for reversal
}

/** Create a new Draft transaction that is a copy of an existing one. */
export interface DuplicateTransactionCommand extends WorkflowCommandBase {
  readonly _type: 'DuplicateTransaction';
  /** Optional override for the transaction date on the duplicate. */
  readonly newDate?: string;
}

export type WorkflowCommand =
  | SubmitTransactionCommand
  | ApproveTransactionCommand
  | RejectTransactionCommand
  | PostTransactionCommand
  | CompleteTransactionCommand
  | CancelTransactionCommand
  | ReverseTransactionCommand
  | DuplicateTransactionCommand;
