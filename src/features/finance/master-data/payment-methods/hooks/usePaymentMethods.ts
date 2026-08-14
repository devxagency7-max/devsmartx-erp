import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodService } from '../services/paymentMethodService';
import type { CreatePaymentMethodInput } from '../types/payment-method.types';

const KEYS = { all: ['payment-methods'] as const };

export function usePaymentMethods() {
  return useQuery({ queryKey: KEYS.all, queryFn: () => paymentMethodService.getAll() });
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentMethodInput) => paymentMethodService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function usePaymentMethodActions() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => paymentMethodService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => paymentMethodService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  return { setStatus, remove };
}
