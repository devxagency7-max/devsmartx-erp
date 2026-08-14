import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PersonFilters } from '../types/person.types';
import { DEFAULT_PERSON_FILTERS } from '../types/person.types';

interface PersonStoreState {
  filters: PersonFilters;
  setFilters: (partial: Partial<PersonFilters>) => void;
  resetFilters: () => void;
}

export const usePersonStore = create<PersonStoreState>()(
  devtools(
    (set) => ({
      filters: DEFAULT_PERSON_FILTERS,
      setFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } }), false, 'people/setFilters'),
      resetFilters: () =>
        set({ filters: DEFAULT_PERSON_FILTERS }, false, 'people/resetFilters'),
    }),
    { name: 'PersonStore' },
  ),
);
