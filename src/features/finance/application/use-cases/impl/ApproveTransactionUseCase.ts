import type { IApproveTransactionUseCase } from '../ITransactionUseCases';
import type { ApproveTransactionCommand } from '../../commands/TransactionCommands';
import type { AppResult } from '../../results/AppResult';
import { appOkVoid, appFail, appValidationFail } from '../../results/AppResult';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';

export class ApproveTransactionUseCase implements IApproveTransactionUseCase {
  async execute(cmd: ApproveTransactionCommand): Promise<AppResult<void>> {
    const existing = await transactionService.getById(cmd.transactionId);
    if (!existing) return appFail('NOT_FOUND', 'Transaction not found');

    if (existing.status !== TransactionStatus.Pending) {
      return appValidationFail([{
        field: 'status',
        message: `Cannot approve a transaction in ${existing.status} state`,
      }]);
    }

    await transactionService.updateStatus(cmd.transactionId, TransactionStatus.Approved, cmd.actorId);
    return appOkVoid();
  }
}

export const approveTransactionUseCase = new ApproveTransactionUseCase();
