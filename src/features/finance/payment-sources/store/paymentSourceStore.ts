import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PaymentSourceFilters } from '../types/paymentSource.types';

const DEFAULT_FILTERS: PaymentSourceFilters = {
  search: '',
  type: '',
  currency: '',
  status: '',
};

interface PaymentSourceStoreState {
  filters: PaymentSourceFilters;
  selectedPaymentSourceId: string | null;
  setFilters: (filters: Partial<PaymentSourceFilters>) => void;
  resetFilters: () => void;
  setSelectedPaymentSourceId: (id: string | null) => void;
}

export const usePaymentSourceStore = create<PaymentSourceStoreState>()(
  devtools(
    (set) => ({
      filters: DEFAULT_FILTERS,
      selectedPaymentSourceId: null,
      setFilters: (filters) =>
        set((s) => ({ filters: { ...s.filters, ...filters } }), false, 'setFilters'),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }, false, 'resetFilters'),
      setSelectedPaymentSourceId: (id) =>
        set({ selectedPaymentSourceId: id }, false, 'setSelectedPaymentSourceId'),
    }),
    { name: 'PaymentSourceStore' },
  ),
);
