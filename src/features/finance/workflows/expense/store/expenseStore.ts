import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ExpenseFilters } from '../types/expense.types';

/**
 * @boundary Expense workflow list-filter UI state only.
 * Wizard state is now managed locally by useFinancialWizard inside ExpenseWizard.
 */

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  categoryId: '',
  paymentSourceId: '',
  status: '',
  paymentMethod: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
};

interface ExpenseState {
  filters: ExpenseFilters;
  setFilters: (partial: Partial<ExpenseFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  devtools(
    (set) => ({
      filters: DEFAULT_FILTERS,
      setFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } }), false, 'expense/setFilters'),
      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'expense/resetFilters'),
      reset: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'expense/reset'),
    }),
    { name: 'ExpenseStore' },
  ),
);
