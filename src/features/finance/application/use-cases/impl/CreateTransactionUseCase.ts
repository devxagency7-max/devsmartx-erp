import type { ICreateTransactionUseCase } from '../ITransactionUseCases';
import type { CreateTransactionCommand } from '../../commands/TransactionCommands';
import type { TransactionDTO } from '../../queries/TransactionQueries';
import type { AppResult } from '../../results/AppResult';
import { appOk, appValidationFail } from '../../results/AppResult';
import { validateCreateTransaction } from '../../validators/TransactionValidator';
import { commandToTransactionRecord, recordToTransactionDTO } from '../../mappers/TransactionMapper';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { paymentSourceService } from '@/features/finance/payment-sources/services/paymentSourceService';
import { categoryService } from '@/features/finance/master-data/categories/services/categoryService';
import { partnerService } from '@/features/finance/master-data/partners/services/partnerService';

export class CreateTransactionUseCase implements ICreateTransactionUseCase {
  async execute(cmd: CreateTransactionCommand): Promise<AppResult<TransactionDTO>> {
    const [source, destSource, category, partner] = await Promise.all([
      paymentSourceService.getById(cmd.paymentSourceId),
      cmd.destinationPaymentSourceId ? paymentSourceService.getById(cmd.destinationPaymentSourceId) : Promise.resolve(null),
      cmd.categoryId ? categoryService.getById(cmd.categoryId) : Promise.resolve(null),
      cmd.partnerId ? partnerService.getById(cmd.partnerId) : Promise.resolve(null),
    ]);

    const errors = validateCreateTransaction(cmd, {
      paymentSourceExists: source !== null,
      destinationPaymentSourceExists: destSource !== null,
      categoryExists: category !== null,
      partnerExists: partner !== null,
    });

    if (errors.length > 0) return appValidationFail(errors);

    const id = `txn-${Date.now()}`;
    const record = commandToTransactionRecord(cmd, id, {
      paymentSourceName: source!.name,
      destinationPaymentSourceName: destSource?.name,
      categoryName: category?.name,
      partnerName: partner?.name,
    });

    const persisted = await transactionService.createFromRecord(record);
    return appOk(recordToTransactionDTO(persisted));
  }
}

export const createTransactionUseCase = new CreateTransactionUseCase();
