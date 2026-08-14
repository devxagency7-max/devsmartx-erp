import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commitmentService } from '../services/commitmentService';
import type {
  CommitmentFilters,
  CreateCommitmentInput,
  RecordCommitmentPaymentInput,
} from '../types/commitment.types';

const KEYS = {
  all: ['commitments'] as const,
  list: (f?: Partial<CommitmentFilters>) => ['commitments', 'list', f] as const,
  detail: (id: string) => ['commitments', id] as const,
  payments: (id: string) => ['commitments', id, 'payments'] as const,
};

export function useCommitments(filters?: Partial<CommitmentFilters>) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => commitmentService.getAll(filters),
    staleTime: 30_000,
  });
}

export function useCommitment(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => commitmentService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCommitmentPayments(commitmentId: string) {
  return useQuery({
    queryKey: KEYS.payments(commitmentId),
    queryFn: () => commitmentService.getPayments(commitmentId),
    enabled: !!commitmentId,
    staleTime: 30_000,
  });
}

export function useCreateCommitment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommitmentInput) => commitmentService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateCommitment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCommitmentInput> }) =>
      commitmentService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMarkCommitmentPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordCommitmentPaymentInput) => commitmentService.markPaid(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useCommitmentActions() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'Active' | 'Paused' | 'Completed' | 'Cancelled' | 'Expired';
    }) => commitmentService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => commitmentService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  return { setStatus, remove };
}
