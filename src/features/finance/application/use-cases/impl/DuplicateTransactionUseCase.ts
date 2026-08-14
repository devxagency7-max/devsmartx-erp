import type { IDuplicateTransactionUseCase } from '../ITransactionUseCases';
import type { DuplicateTransactionCommand } from '../../commands/TransactionCommands';
import type { AppResult } from '../../results/AppResult';
import { appOk, appFail } from '../../results/AppResult';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { generateReference } from '@/features/finance/transactions/utils/generateReference';

export class DuplicateTransactionUseCase implements IDuplicateTransactionUseCase {
  async execute(cmd: DuplicateTransactionCommand): Promise<AppResult<{ newTransactionId: string }>> {
    const original = await transactionService.getById(cmd.transactionId);
    if (!original) return appFail('NOT_FOUND', 'Transaction not found');

    const newId = `txn-dup-${Date.now()}`;
    const now = new Date().toISOString();
    const copy = {
      ...original,
      id: newId,
      referenceNumber: generateReference(original.type),
      status: TransactionStatus.Draft,
      transactionDate: cmd.newDate ?? now.slice(0, 10),
      originalTransactionId: null,
      originalTransactionRef: null,
      approvedBy: null,
      createdAt: now,
      updatedAt: now,
      createdBy: cmd.actorId,
    };

    await transactionService.createFromRecord(copy);
    return appOk({ newTransactionId: newId });
  }
}

export const duplicateTransactionUseCase = new DuplicateTransactionUseCase();
