import { useQuery } from '@tanstack/react-query';
import { expenseService } from '../services/expenseService';

export function useExpense(id: string) {
  const query = useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expenseService.getById(id),
    enabled: !!id,
  });

  return {
    expense: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
