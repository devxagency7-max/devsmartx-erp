import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { costCenterService } from '../services/costCenterService';
import type { CreateCostCenterInput, CostCenterFilters } from '../types/cost-center.types';

const KEYS = {
  all: ['cost-centers'] as const,
  list: (f?: Partial<CostCenterFilters>) => ['cost-centers', 'list', f] as const,
  detail: (id: string) => ['cost-centers', id] as const,
};

export function useCostCenters(filters?: Partial<CostCenterFilters>) {
  return useQuery({ queryKey: KEYS.list(filters), queryFn: () => costCenterService.getAll(filters) });
}

export function useCostCenter(id: string) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => costCenterService.getById(id), enabled: !!id });
}

export function useCreateCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCostCenterInput) => costCenterService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCostCenterInput> }) => costCenterService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCostCenterActions() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => costCenterService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => costCenterService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  return { setStatus, remove };
}
