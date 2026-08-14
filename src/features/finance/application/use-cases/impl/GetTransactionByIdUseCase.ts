import type { IGetTransactionByIdUseCase } from '../ITransactionUseCases';
import type { GetTransactionByIdQuery, TransactionDTO } from '../../queries/TransactionQueries';
import type { AppResult } from '../../results/AppResult';
import { appOk, appFail } from '../../results/AppResult';
import { recordToTransactionDTO } from '../../mappers/TransactionMapper';
import { transactionService } from '@/features/finance/transactions/services/transactionService';

export class GetTransactionByIdUseCase implements IGetTransactionByIdUseCase {
  async execute(query: GetTransactionByIdQuery): Promise<AppResult<TransactionDTO>> {
    const record = await transactionService.getById(query.transactionId);
    if (!record) return appFail('NOT_FOUND', 'Transaction not found');
    return appOk(recordToTransactionDTO(record));
  }
}

export const getTransactionByIdUseCase = new GetTransactionByIdUseCase();
