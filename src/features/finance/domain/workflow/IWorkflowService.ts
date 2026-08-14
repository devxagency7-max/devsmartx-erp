import type { WorkflowResult } from './WorkflowResult';
import type {
  SubmitTransactionCommand,
  ApproveTransactionCommand,
  RejectTransactionCommand,
  PostTransactionCommand,
  CompleteTransactionCommand,
  CancelTransactionCommand,
  ReverseTransactionCommand,
  DuplicateTransactionCommand,
} from './WorkflowCommands';
import type { WorkflowAuditEntry } from './WorkflowAudit';
import type { WorkflowState } from '../enums/WorkflowState';

/**
 * Service interface for the Financial Workflow Engine.
 * Every workflow command flows through this contract.
 * Concrete implementations (in-memory, API-backed) satisfy this interface.
 */
export interface IWorkflowService {
  /** Retrieve the current workflow state of a transaction. */
  getState(transactionId: string): Promise<WorkflowResult<WorkflowState>>;

  /** Retrieve the full audit trail for a transaction. */
  getAuditTrail(transactionId: string): Promise<WorkflowResult<WorkflowAuditEntry[]>>;

  submit(cmd: SubmitTransactionCommand): Promise<WorkflowResult<void>>;
  approve(cmd: ApproveTransactionCommand): Promise<WorkflowResult<void>>;
  reject(cmd: RejectTransactionCommand): Promise<WorkflowResult<void>>;
  post(cmd: PostTransactionCommand): Promise<WorkflowResult<void>>;
  complete(cmd: CompleteTransactionCommand): Promise<WorkflowResult<void>>;
  cancel(cmd: CancelTransactionCommand): Promise<WorkflowResult<void>>;

  /**
   * Reverse a Posted or Completed transaction.
   * Returns the ID of the newly created reversing transaction.
   */
  reverse(cmd: ReverseTransactionCommand): Promise<WorkflowResult<{ reversingTransactionId: string }>>;

  /**
   * Duplicate a transaction as a new Draft.
   * Returns the ID of the newly created transaction.
   */
  duplicate(cmd: DuplicateTransactionCommand): Promise<WorkflowResult<{ newTransactionId: string }>>;
}
