/**
 * Unified result pattern for the Financial Application Layer.
 * Use Cases never throw — they always return AppResult<T>.
 */
export type AppResult<T = void> =
  | AppSuccess<T>
  | AppFailure;

export interface AppSuccess<T> {
  readonly success: true;
  readonly data: T;
  readonly warnings?: AppWarning[];
  readonly metadata?: Record<string, unknown>;
}

export interface AppFailure {
  readonly success: false;
  readonly error: AppError;
  readonly validationErrors?: ValidationError[];
}

export interface AppError {
  readonly code: AppErrorCode;
  readonly message: string;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

export interface AppWarning {
  readonly code: string;
  readonly message: string;
}

export type AppErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'INVALID_TRANSITION'
  | 'PERMISSION_DENIED'
  | 'BUSINESS_RULE_VIOLATION'
  | 'CONFLICT'
  | 'UNKNOWN';

/** Helper: successful result with data. */
export function appOk<T>(data: T, warnings?: AppWarning[], metadata?: Record<string, unknown>): AppResult<T> {
  return { success: true, data, warnings, metadata };
}

/** Helper: successful void result. */
export function appOkVoid(warnings?: AppWarning[]): AppResult<void> {
  return { success: true, data: undefined, warnings };
}

/** Helper: failed result. */
export function appFail(code: AppErrorCode, message: string, validationErrors?: ValidationError[]): AppResult<never> {
  return { success: false, error: { code, message }, validationErrors };
}

/** Helper: validation failure with field errors. */
export function appValidationFail(validationErrors: ValidationError[]): AppResult<never> {
  return { success: false, error: { code: 'VALIDATION_FAILED', message: 'Validation failed' }, validationErrors };
}
