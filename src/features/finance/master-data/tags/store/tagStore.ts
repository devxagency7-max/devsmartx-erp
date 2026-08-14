import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TagFilters } from '../types/tag.types';

/** @boundary Finance / Master Data — Tags UI filters only */
interface TagStore {
  filters: TagFilters;
  setFilters: (f: Partial<TagFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initialFilters: TagFilters = { search: '', status: '' };

export const useTagStore = create<TagStore>()(
  devtools(
    (set) => ({
      filters: initialFilters,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } }), false, 'setFilters'),
      resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
      reset: () => set({ filters: initialFilters }, false, 'reset'),
    }),
    { name: 'TagStore' }
  )
);
