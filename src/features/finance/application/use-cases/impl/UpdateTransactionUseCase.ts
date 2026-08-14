import type { IUpdateTransactionUseCase } from '../ITransactionUseCases';
import type { UpdateTransactionCommand } from '../../commands/TransactionCommands';
import type { TransactionDTO } from '../../queries/TransactionQueries';
import type { AppResult } from '../../results/AppResult';
import { appOk, appFail, appValidationFail } from '../../results/AppResult';
import { validateUpdateTransaction } from '../../validators/TransactionValidator';
import { recordToTransactionDTO } from '../../mappers/TransactionMapper';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { WorkflowState } from '@/features/finance/domain/enums/WorkflowState';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import type { CurrencyCode } from '@/shared/types/currency';
import type { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';

function statusToWorkflowState(status: TransactionStatus): WorkflowState {
  const map: Record<TransactionStatus, WorkflowState> = {
    [TransactionStatus.Draft]:     WorkflowState.Draft,
    [TransactionStatus.Pending]:   WorkflowState.Submitted,
    [TransactionStatus.Approved]:  WorkflowState.Approved,
    [TransactionStatus.Completed]: WorkflowState.Completed,
    [TransactionStatus.Cancelled]: WorkflowState.Cancelled,
    [TransactionStatus.Rejected]:  WorkflowState.Rejected,
  };
  return map[status] ?? WorkflowState.Draft;
}

export class UpdateTransactionUseCase implements IUpdateTransactionUseCase {
  async execute(cmd: UpdateTransactionCommand): Promise<AppResult<TransactionDTO>> {
    const existing = await transactionService.getById(cmd.transactionId);
    if (!existing) return appFail('NOT_FOUND', 'Transaction not found');

    const errors = validateUpdateTransaction(cmd, {
      currentWorkflowState: statusToWorkflowState(existing.status),
    });
    if (errors.length > 0) return appValidationFail(errors);

    const updated = await transactionService.update(cmd.transactionId, {
      ...(cmd.patch.paymentSourceId && { paymentSourceId: cmd.patch.paymentSourceId }),
      ...(cmd.patch.destinationPaymentSourceId !== undefined && { destinationPaymentSourceId: cmd.patch.destinationPaymentSourceId }),
      ...(cmd.patch.amount !== undefined && { amount: cmd.patch.amount }),
      ...(cmd.patch.currency && { currency: cmd.patch.currency as CurrencyCode }),
      ...(cmd.patch.paymentMethod && { paymentMethod: cmd.patch.paymentMethod as PaymentMethod }),
      ...(cmd.patch.categoryId !== undefined && { categoryId: cmd.patch.categoryId }),
      ...(cmd.patch.description && { description: cmd.patch.description }),
      ...(cmd.patch.notes !== undefined && { notes: cmd.patch.notes }),
      ...(cmd.patch.transactionDate && { transactionDate: cmd.patch.transactionDate }),
    });

    return appOk(recordToTransactionDTO(updated));
  }
}

export const updateTransactionUseCase = new UpdateTransactionUseCase();
