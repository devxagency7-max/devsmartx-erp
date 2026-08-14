import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import type { TransactionFilters } from '../types/transaction.types';

/**
 * @boundary Transaction UI state only.
 * Server data fetched via hooks. This store holds filter state.
 */

interface TransactionState {
  filters: TransactionFilters;
  setFilters: (partial: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  type: '' as TransactionType | '',
  paymentSourceId: '',
  status: '' as TransactionStatus | '',
  currency: '',
  paymentMethod: '',
  categoryId: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
};

export const useTransactionStore = create<TransactionState>()(
  devtools(
    (set) => ({
      filters: DEFAULT_FILTERS,

      setFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } }), false, 'txn/setFilters'),

      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'txn/resetFilters'),

      reset: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'txn/reset'),
    }),
    { name: 'TransactionStore' },
  ),
);
