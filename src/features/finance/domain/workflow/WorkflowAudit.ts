import { WorkflowState } from '../enums/WorkflowState';

/**
 * Immutable audit entry recorded for every state transition.
 * Written by the workflow service layer — never by components.
 */
export interface WorkflowAuditEntry {
  readonly id: string;
  readonly transactionId: string;
  readonly fromState: WorkflowState;
  readonly toState: WorkflowState;
  readonly actorId: string;          // user who triggered the transition
  readonly actorName: string;
  readonly reason: string | null;    // optional reason / comment
  readonly correlationId: string;    // links related transitions (e.g. reverse chain)
  readonly occurredAt: string;       // ISO 8601 UTC
}
