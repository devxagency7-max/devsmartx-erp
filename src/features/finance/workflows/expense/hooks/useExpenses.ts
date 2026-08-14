import { useQuery } from '@tanstack/react-query';
import { expenseService } from '../services/expenseService';
import { useExpenseStore } from '../store/expenseStore';

export const EXPENSES_QUERY_KEY = ['expenses'] as const;

export function useExpenses() {
  const filters = useExpenseStore((s) => s.filters);

  const query = useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, filters],
    queryFn: () => expenseService.getAll(filters),
    staleTime: 30_000,
  });

  return {
    expenses: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
