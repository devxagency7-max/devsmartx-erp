import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { TRANSACTIONS_QUERY_KEY } from './useTransactions';

export function useTransactionActions() {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function cancel(id: string): Promise<boolean> {
    setLoadingId(id);
    try {
      await transactionService.cancel(id);
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      return true;
    } catch {
      return false;
    } finally {
      setLoadingId(null);
    }
  }

  async function duplicate(id: string): Promise<string | null> {
    setLoadingId(id);
    try {
      const copy = await transactionService.duplicate(id, 'current-user');
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      return copy.id;
    } catch {
      return null;
    } finally {
      setLoadingId(null);
    }
  }

  async function remove(id: string): Promise<boolean> {
    setLoadingId(id);
    try {
      await transactionService.delete(id);
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      return true;
    } catch {
      return false;
    } finally {
      setLoadingId(null);
    }
  }

  return { cancel, duplicate, remove, isLoadingId: loadingId };
}
