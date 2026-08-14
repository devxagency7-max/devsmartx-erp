import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { TRANSACTIONS_QUERY_KEY } from './useTransactions';

export function useTransaction(id: string) {
  const query = useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, id],
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });

  return {
    transaction: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
