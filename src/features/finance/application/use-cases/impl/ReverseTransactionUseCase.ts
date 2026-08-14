import type { IReverseTransactionUseCase } from '../ITransactionUseCases';
import type { ReverseTransactionCommand } from '../../commands/TransactionCommands';
import type { AppResult } from '../../results/AppResult';
import { appOk, appFail, appValidationFail } from '../../results/AppResult';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { generateReference } from '@/features/finance/transactions/utils/generateReference';

const REVERSIBLE: ReadonlySet<TransactionStatus> = new Set([
  TransactionStatus.Completed,
]);

export class ReverseTransactionUseCase implements IReverseTransactionUseCase {
  async execute(cmd: ReverseTransactionCommand): Promise<AppResult<{ reversingTransactionId: string }>> {
    const original = await transactionService.getById(cmd.transactionId);
    if (!original) return appFail('NOT_FOUND', 'Transaction not found');

    if (!REVERSIBLE.has(original.status)) {
      return appValidationFail([{
        field: 'status',
        message: `Cannot reverse a transaction in ${original.status} state`,
      }]);
    }

    const reversingId = `txn-rev-${Date.now()}`;
    const reversingRecord = {
      ...original,
      id: reversingId,
      referenceNumber: generateReference(original.type),
      status: TransactionStatus.Completed,
      originalTransactionId: original.id,
      originalTransactionRef: original.referenceNumber,
      // Reverse the amounts: flip sign conceptually via description
      description: `REVERSAL: ${original.description}`,
      notes: cmd.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: cmd.actorId,
      approvedBy: cmd.actorId,
    };

    await transactionService.createFromRecord(reversingRecord);
    await transactionService.updateStatus(cmd.transactionId, TransactionStatus.Cancelled);

    return appOk({ reversingTransactionId: reversingId });
  }
}

export const reverseTransactionUseCase = new ReverseTransactionUseCase();
