import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PartnerFilters } from '../types/partner.types';

/** @boundary Finance / Master Data — Partners UI filters only */
interface PartnerStore {
  filters: PartnerFilters;
  setFilters: (f: Partial<PartnerFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initialFilters: PartnerFilters = { search: '', status: '' };

export const usePartnerStore = create<PartnerStore>()(
  devtools(
    (set) => ({
      filters: initialFilters,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } }), false, 'setFilters'),
      resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
      reset: () => set({ filters: initialFilters }, false, 'reset'),
    }),
    { name: 'PartnerStore' }
  )
);
