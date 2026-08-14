import { transactionService } from '@/features/finance/transactions/services/transactionService';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type { TransactionRecord, TransactionFilters } from '@/features/finance/transactions/types/transaction.types';
import type { RevenueFilters } from '../types/revenue.types';

export const revenueService = {
  async getAll(filters?: Partial<RevenueFilters>): Promise<TransactionRecord[]> {
    const txFilters: Partial<TransactionFilters> = {
      type: TransactionType.Revenue,
      ...(filters?.search          && { search: filters.search }),
      ...(filters?.categoryId      && { categoryId: filters.categoryId }),
      ...(filters?.walletId        && { walletId: filters.walletId }),
      ...(filters?.status          && { status: filters.status as TransactionFilters['status'] }),
      ...(filters?.paymentMethod   && { paymentMethod: filters.paymentMethod as TransactionFilters['paymentMethod'] }),
      ...(filters?.dateFrom        && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo          && { dateTo: filters.dateTo }),
      ...(filters?.amountMin       && { amountMin: filters.amountMin }),
      ...(filters?.amountMax       && { amountMax: filters.amountMax }),
    };
    return transactionService.getAll(txFilters);
  },

  async getById(id: string): Promise<TransactionRecord | null> {
    const record = await transactionService.getById(id);
    if (!record || record.type !== TransactionType.Revenue) return null;
    return record;
  },
};
