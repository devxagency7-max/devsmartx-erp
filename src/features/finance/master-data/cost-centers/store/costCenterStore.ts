import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CostCenterFilters } from '../types/cost-center.types';

/** @boundary Finance / Master Data — Cost Centers UI filters only */
interface CostCenterStore {
  filters: CostCenterFilters;
  setFilters: (f: Partial<CostCenterFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initialFilters: CostCenterFilters = { search: '', status: '' };

export const useCostCenterStore = create<CostCenterStore>()(
  devtools(
    (set) => ({
      filters: initialFilters,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } }), false, 'setFilters'),
      resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
      reset: () => set({ filters: initialFilters }, false, 'reset'),
    }),
    { name: 'CostCenterStore' }
  )
);
