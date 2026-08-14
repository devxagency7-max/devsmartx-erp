import type { TransactionRecord } from '@/features/finance/transactions/types/transaction.types';

export type RevenueRecord = TransactionRecord;

export interface RevenueFilters {
  search: string;
  categoryId: string;
  walletId: string;
  status: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  relatedProject: string;
}
