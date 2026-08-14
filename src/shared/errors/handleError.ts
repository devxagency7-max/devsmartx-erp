import { AuthenticationError } from './AuthenticationError';
import { ApiError } from '@/core/api/errors';
import { ERROR_MESSAGES } from './errorMessages';
import { logger } from '@/shared/logger';

export interface NormalizedError {
  code: string;
  message: string;
  details?: unknown;
}

export function handleError(error: unknown): NormalizedError {
  if (error instanceof AuthenticationError) {
    return { code: error.code, message: error.message };
  }

  if (error instanceof ApiError) {
    return { code: error.code, message: error.message, details: error.details };
  }

  if (error instanceof Error) {
    logger.error(error.message, error);
    return { code: 'UNKNOWN', message: ERROR_MESSAGES.UNKNOWN };
  }

  logger.error('Unknown error', error);
  return { code: 'UNKNOWN', message: ERROR_MESSAGES.UNKNOWN };
}
