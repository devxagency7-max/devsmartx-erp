import type { IGetTransactionListUseCase } from '../ITransactionUseCases';
import type { GetTransactionListQuery, TransactionDTO, TransactionListDTO } from '../../queries/TransactionQueries';
import type { AppResult } from '../../results/AppResult';
import { appOk } from '../../results/AppResult';
import { recordToTransactionDTO } from '../../mappers/TransactionMapper';
import { transactionService } from '@/features/finance/transactions/services/transactionService';
import type { TransactionFilters } from '@/features/finance/transactions/types/transaction.types';

export class GetTransactionListUseCase implements IGetTransactionListUseCase {
  async execute(query: GetTransactionListQuery): Promise<AppResult<TransactionListDTO>> {
    const filters: Partial<TransactionFilters> = {
      ...(query.paymentSourceId && { paymentSourceId: query.paymentSourceId }),
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.currency && { currency: query.currency as import('@/shared/types/currency').CurrencyCode }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.dateFrom && { dateFrom: query.dateFrom }),
      ...(query.dateTo && { dateTo: query.dateTo }),
      ...(query.amountMin !== undefined && { amountMin: String(query.amountMin) }),
      ...(query.amountMax !== undefined && { amountMax: String(query.amountMax) }),
      ...(query.search && { search: query.search }),
    };

    const all = await transactionService.getAll(filters);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const items: TransactionDTO[] = all.slice(start, start + pageSize).map(recordToTransactionDTO);

    return appOk({ items, total: all.length, page, pageSize });
  }
}

export const getTransactionListUseCase = new GetTransactionListUseCase();
