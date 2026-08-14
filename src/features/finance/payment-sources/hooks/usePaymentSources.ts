import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentSourceService } from '../services/paymentSourceService';
import { usePaymentSourceStore } from '../store/paymentSourceStore';
import type { CreatePaymentSourceInput, EditPaymentSourceInput } from '../types/paymentSource.types';

export const PAYMENT_SOURCES_QUERY_KEY = ['payment-sources'] as const;

export function usePaymentSources() {
  const filters = usePaymentSourceStore((s) => s.filters);
  const query = useQuery({
    queryKey: [...PAYMENT_SOURCES_QUERY_KEY, filters],
    queryFn: () => paymentSourceService.getAll(filters),
    staleTime: 30_000,
  });
  return {
    paymentSources: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePaymentSource(id: string) {
  return useQuery({
    queryKey: [...PAYMENT_SOURCES_QUERY_KEY, id],
    queryFn: () => paymentSourceService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreatePaymentSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentSourceInput) => paymentSourceService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_SOURCES_QUERY_KEY }),
  });
}

export function useEditPaymentSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EditPaymentSourceInput }) =>
      paymentSourceService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_SOURCES_QUERY_KEY }),
  });
}

export function usePaymentSourceActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: 'activate' | 'deactivate' | 'archive' | 'delete';
    }): Promise<void> => {
      if (action === 'delete') {
        await paymentSourceService.delete(id);
        return;
      }
      const statusMap = {
        activate: 'active' as const,
        deactivate: 'inactive' as const,
        archive: 'archived' as const,
      };
      await paymentSourceService.setStatus(id, statusMap[action]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_SOURCES_QUERY_KEY }),
  });
}
