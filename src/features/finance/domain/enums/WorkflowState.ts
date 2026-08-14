/** All possible lifecycle states for a financial transaction. */
export enum WorkflowState {
  Draft     = 'Draft',
  Submitted = 'Submitted',
  Approved  = 'Approved',
  Posted    = 'Posted',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rejected  = 'Rejected',
  Reversed  = 'Reversed',
}
