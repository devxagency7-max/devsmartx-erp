import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../services/partnerService';
import type { CreatePartnerInput, PartnerFilters } from '../types/partner.types';

const KEYS = {
  all: ['partners'] as const,
  list: (f?: Partial<PartnerFilters>) => ['partners', 'list', f] as const,
  detail: (id: string) => ['partners', id] as const,
};

export function usePartners(filters?: Partial<PartnerFilters>) {
  return useQuery({ queryKey: KEYS.list(filters), queryFn: () => partnerService.getAll(filters) });
}

export function usePartner(id: string) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => partnerService.getById(id), enabled: !!id });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePartnerInput) => partnerService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreatePartnerInput> }) => partnerService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function usePartnerActions() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => partnerService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => partnerService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  return { setStatus, remove };
}
