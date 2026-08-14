import type { ErrorCode } from './errorCodes';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EXPIRED_SESSION: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED: 'You must be signed in to access this page.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN: 'An unexpected error occurred.',
};
