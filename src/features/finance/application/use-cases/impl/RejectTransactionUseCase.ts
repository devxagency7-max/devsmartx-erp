import type { IRejectTransactionUseCase } from '../ITransactionUseCases';
import type { RejectTransactionCommand } from '../../commands/TransactionCommands';
import type { AppResult } from '../../results/AppResult';
import { appOkVoid, appFail, appValidationFail } from '../../results/AppResult';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';

const REJECTABLE: ReadonlySet<TransactionStatus> = new Set([
  TransactionStatus.Pending,
  TransactionStatus.Approved,
]);

export class RejectTransactionUseCase implements IRejectTransactionUseCase {
  async execute(cmd: RejectTransactionCommand): Promise<AppResult<void>> {
    const existing = await transactionService.getById(cmd.transactionId);
    if (!existing) return appFail('NOT_FOUND', 'Transaction not found');

    if (!REJECTABLE.has(existing.status)) {
      return appValidationFail([{
        field: 'status',
        message: `Cannot reject a transaction in ${existing.status} state`,
      }]);
    }

    await transactionService.updateStatus(cmd.transactionId, TransactionStatus.Rejected);
    return appOkVoid();
  }
}

export const rejectTransactionUseCase = new RejectTransactionUseCase();
