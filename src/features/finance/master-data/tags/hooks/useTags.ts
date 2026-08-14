import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagService } from '../services/tagService';
import type { CreateTagInput, TagFilters } from '../types/tag.types';

const KEYS = {
  all: ['tags'] as const,
  list: (f?: Partial<TagFilters>) => ['tags', 'list', f] as const,
  detail: (id: string) => ['tags', id] as const,
};

export function useTags(filters?: Partial<TagFilters>) {
  return useQuery({ queryKey: KEYS.list(filters), queryFn: () => tagService.getAll(filters) });
}

export function useTag(id: string) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => tagService.getById(id), enabled: !!id });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTagInput) => tagService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateTagInput> }) => tagService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useTagActions() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => tagService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => tagService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  return { setStatus, remove };
}
