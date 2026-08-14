import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useTransactionStore } from '../store/transactionStore';

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const;

export function useTransactions() {
  const filters = useTransactionStore((s) => s.filters);

  const query = useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: () => transactionService.getAll(filters),
    staleTime: 30_000,
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
