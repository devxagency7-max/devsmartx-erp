import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/** @boundary Finance / Master Data — Payment Methods UI state only */
interface PaymentMethodStore {
  search: string;
  setSearch: (s: string) => void;
  reset: () => void;
}

export const usePaymentMethodStore = create<PaymentMethodStore>()(
  devtools(
    (set) => ({
      search: '',
      setSearch: (s) => set({ search: s }, false, 'setSearch'),
      reset: () => set({ search: '' }, false, 'reset'),
    }),
    { name: 'PaymentMethodStore' }
  )
);
