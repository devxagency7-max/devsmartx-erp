import type { CreateTransactionCommand, UpdateTransactionCommand } from '../commands/TransactionCommands';
import type { ValidationError } from '../results/AppResult';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { WorkflowState, isTransitionAllowed } from '@/features/finance/domain/workflow';

/**
 * Application-level validators for transaction commands.
 * These run AFTER form/schema validation and check domain/cross-entity rules.
 * No UI imports. No Zustand. No React.
 */

export function validateCreateTransaction(
  cmd: CreateTransactionCommand,
  ctx: TransactionValidationContext,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ctx.paymentSourceExists) {
    errors.push({ field: 'paymentSourceId', message: 'Payment source does not exist' });
  }

  if (cmd.type === TransactionType.Transfer) {
    if (!cmd.destinationPaymentSourceId) {
      errors.push({ field: 'destinationPaymentSourceId', message: 'Destination payment source is required for transfers' });
    } else {
      if (!ctx.destinationPaymentSourceExists) {
        errors.push({ field: 'destinationPaymentSourceId', message: 'Destination payment source does not exist' });
      }
      if (cmd.paymentSourceId === cmd.destinationPaymentSourceId) {
        errors.push({ field: 'destinationPaymentSourceId', message: 'Source and destination payment source cannot be the same' });
      }
    }
  }

  if (
    cmd.type === TransactionType.PartnerContribution &&
    !cmd.partnerId
  ) {
    errors.push({ field: 'partnerId', message: 'Partner is required for partner contributions' });
  }

  if (cmd.partnerId && !ctx.partnerExists) {
    errors.push({ field: 'partnerId', message: 'Partner does not exist' });
  }

  if (cmd.categoryId && !ctx.categoryExists) {
    errors.push({ field: 'categoryId', message: 'Category does not exist' });
  }

  if (cmd.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than zero' });
  }

  return errors;
}

export function validateUpdateTransaction(
  cmd: UpdateTransactionCommand,
  ctx: { currentWorkflowState: WorkflowState },
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (ctx.currentWorkflowState !== WorkflowState.Draft) {
    errors.push({ field: 'transactionId', message: 'Only Draft transactions can be edited' });
  }

  if (cmd.patch.amount !== undefined && cmd.patch.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than zero' });
  }

  if (
    cmd.patch.paymentSourceId !== undefined &&
    cmd.patch.destinationPaymentSourceId !== undefined &&
    cmd.patch.paymentSourceId === cmd.patch.destinationPaymentSourceId
  ) {
    errors.push({ field: 'destinationPaymentSourceId', message: 'Source and destination payment source cannot be the same' });
  }

  return errors;
}

export function validateWorkflowTransition(
  current: WorkflowState,
  next: WorkflowState,
): ValidationError[] {
  if (!isTransitionAllowed(current, next)) {
    return [{ field: 'status', message: `Cannot transition from ${current} to ${next}` }];
  }
  return [];
}

/** Context object supplied by the use case from service lookups. */
export interface TransactionValidationContext {
  paymentSourceExists: boolean;
  destinationPaymentSourceExists?: boolean;
  partnerExists?: boolean;
  categoryExists?: boolean;
}
