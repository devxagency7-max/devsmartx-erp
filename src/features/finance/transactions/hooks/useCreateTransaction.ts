import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { paymentSourceService } from '@/features/finance/payment-sources/services/paymentSourceService';
import { TRANSACTIONS_QUERY_KEY } from './useTransactions';
import type { TransactionFormInput, TransactionRecord } from '../types/transaction.types';

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createTransaction(
    input: TransactionFormInput,
  ): Promise<TransactionRecord | null> {
    setIsLoading(true);
    setError(null);
    try {
      const source = await paymentSourceService.getById(input.paymentSourceId);
      const destSource = input.destinationPaymentSourceId
        ? await paymentSourceService.getById(input.destinationPaymentSourceId)
        : null;

      const record = await transactionService.create(
        input,
        'current-user',
        source?.name ?? '',
        destSource?.name ?? undefined,
      );
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'transaction.errors.createFailed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { createTransaction, isLoading, error, clearError: () => setError(null) };
}
