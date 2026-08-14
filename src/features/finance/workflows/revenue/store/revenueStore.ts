import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RevenueFilters } from '../types/revenue.types';

/**
 * @boundary Revenue workflow list-filter UI state only.
 * Wizard state is managed locally by useFinancialWizard inside RevenueWizard.
 */

const DEFAULT_FILTERS: RevenueFilters = {
  search: '',
  categoryId: '',
  walletId: '',
  status: '',
  paymentMethod: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  relatedProject: '',
};

interface RevenueState {
  filters: RevenueFilters;
  setFilters: (partial: Partial<RevenueFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

export const useRevenueStore = create<RevenueState>()(
  devtools(
    (set) => ({
      filters: DEFAULT_FILTERS,
      setFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } }), false, 'revenue/setFilters'),
      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'revenue/resetFilters'),
      reset: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'revenue/reset'),
    }),
    { name: 'RevenueStore' },
  ),
);
