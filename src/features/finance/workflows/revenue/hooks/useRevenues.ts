import { useQuery } from '@tanstack/react-query';
import { revenueService } from '../services/revenueService';
import { useRevenueStore } from '../store/revenueStore';

export const REVENUES_QUERY_KEY = ['revenues'] as const;

export function useRevenues() {
  const filters = useRevenueStore((s) => s.filters);

  const query = useQuery({
    queryKey: [...REVENUES_QUERY_KEY, filters],
    queryFn: () => revenueService.getAll(filters),
    staleTime: 30_000,
  });

  return {
    revenues: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
