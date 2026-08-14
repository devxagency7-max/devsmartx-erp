import type { ICancelTransactionUseCase } from '../ITransactionUseCases';
import type { CancelTransactionCommand } from '../../commands/TransactionCommands';
import type { AppResult } from '../../results/AppResult';
import { appOkVoid, appFail, appValidationFail } from '../../results/AppResult';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';

const CANCELLABLE: ReadonlySet<TransactionStatus> = new Set([
  TransactionStatus.Draft,
  TransactionStatus.Pending,
  TransactionStatus.Approved,
]);

export class CancelTransactionUseCase implements ICancelTransactionUseCase {
  async execute(cmd: CancelTransactionCommand): Promise<AppResult<void>> {
    const existing = await transactionService.getById(cmd.transactionId);
    if (!existing) return appFail('NOT_FOUND', 'Transaction not found');

    if (!CANCELLABLE.has(existing.status)) {
      return appValidationFail([{
        field: 'status',
        message: `Cannot cancel a transaction in ${existing.status} state`,
      }]);
    }

    await transactionService.updateStatus(cmd.transactionId, TransactionStatus.Cancelled);
    return appOkVoid();
  }
}

export const cancelTransactionUseCase = new CancelTransactionUseCase();
