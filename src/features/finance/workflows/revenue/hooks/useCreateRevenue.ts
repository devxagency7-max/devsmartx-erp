import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransactionUseCase } from '@/features/finance/application/use-cases/impl';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';
import { REVENUES_QUERY_KEY } from './useRevenues';

export function useCreateRevenue() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkflowFormData) => {
      const result = await createTransactionUseCase.execute({
        _type: 'CreateTransaction',
        type: TransactionType.Revenue,
        paymentSourceId: data.paymentSourceId,
        amount: data.amount as number,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
        description: data.description,
        notes: data.notes || undefined,
        transactionDate: data.transactionDate,
        actorId: 'current-user',
      });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVENUES_QUERY_KEY });
    },
  });
}
