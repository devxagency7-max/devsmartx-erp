import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CommitmentFilters } from '../types/commitment.types';
import { DEFAULT_COMMITMENT_FILTERS } from '../types/commitment.types';

interface CommitmentStoreState {
  filters: CommitmentFilters;
  setFilters: (partial: Partial<CommitmentFilters>) => void;
  resetFilters: () => void;
}

export const useCommitmentStore = create<CommitmentStoreState>()(
  devtools(
    (set) => ({
      filters: DEFAULT_COMMITMENT_FILTERS,
      setFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } }), false, 'commitments/setFilters'),
      resetFilters: () =>
        set({ filters: DEFAULT_COMMITMENT_FILTERS }, false, 'commitments/resetFilters'),
    }),
    { name: 'CommitmentStore' },
  ),
);
