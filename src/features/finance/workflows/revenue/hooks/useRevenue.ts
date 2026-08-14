import { useQuery } from '@tanstack/react-query';
import { revenueService } from '../services/revenueService';

export function useRevenue(id: string) {
  const query = useQuery({
    queryKey: ['revenues', id],
    queryFn: () => revenueService.getById(id),
    enabled: !!id,
  });

  return {
    revenue: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
