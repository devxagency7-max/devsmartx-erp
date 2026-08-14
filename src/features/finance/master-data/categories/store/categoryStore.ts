import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CategoryFilters } from '../types/category.types';

/** @boundary Finance / Master Data — Categories UI filters only */
interface CategoryStore {
  filters: CategoryFilters;
  setFilters: (f: Partial<CategoryFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initialFilters: CategoryFilters = { search: '', status: '' };

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    (set) => ({
      filters: initialFilters,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } }), false, 'setFilters'),
      resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
      reset: () => set({ filters: initialFilters }, false, 'reset'),
    }),
    { name: 'CategoryStore' }
  )
);
