import type { ISubmitTransactionUseCase } from '../ITransactionUseCases';
import type { SubmitTransactionCommand } from '../../commands/TransactionCommands';
import type { AppResult } from '../../results/AppResult';
import { appOkVoid, appFail, appValidationFail } from '../../results/AppResult';
import { validateWorkflowTransition } from '../../validators/TransactionValidator';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { WorkflowState } from '@/features/finance/domain/enums/WorkflowState';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';

export class SubmitTransactionUseCase implements ISubmitTransactionUseCase {
  async execute(cmd: SubmitTransactionCommand): Promise<AppResult<void>> {
    const existing = await transactionService.getById(cmd.transactionId);
    if (!existing) return appFail('NOT_FOUND', 'Transaction not found');

    const errors = validateWorkflowTransition(WorkflowState.Draft, WorkflowState.Submitted);
    if (existing.status !== TransactionStatus.Draft) {
      return appValidationFail([{ field: 'status', message: `Cannot submit a transaction in ${existing.status} state` }]);
    }
    if (errors.length > 0) return appValidationFail(errors);

    await transactionService.updateStatus(cmd.transactionId, TransactionStatus.Pending);
    return appOkVoid();
  }
}

export const submitTransactionUseCase = new SubmitTransactionUseCase();
