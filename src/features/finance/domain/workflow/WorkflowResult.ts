/**
 * Result pattern for all workflow commands.
 * Commands never throw — they return a typed result that callers must check.
 */
export type WorkflowResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: WorkflowError };

export interface WorkflowError {
  code: WorkflowErrorCode;
  message: string;
  /** The transition that was attempted, for diagnostics. */
  context?: Record<string, string>;
}

export type WorkflowErrorCode =
  | 'INVALID_TRANSITION'
  | 'PERMISSION_DENIED'
  | 'BUSINESS_RULE_VIOLATION'
  | 'TRANSACTION_NOT_FOUND'
  | 'ALREADY_IN_STATE'
  | 'TERMINAL_STATE';

/** Helper: construct a successful result. */
export function ok<T>(data: T): WorkflowResult<T> {
  return { success: true, data };
}

export function okVoid(): WorkflowResult<void> {
  return { success: true, data: undefined };
}

/** Helper: construct a failed result. */
export function fail(code: WorkflowErrorCode, message: string, context?: Record<string, string>): WorkflowResult<never> {
  return { success: false, error: { code, message, context } };
}
