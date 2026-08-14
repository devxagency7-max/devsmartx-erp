import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import type { CreateCategoryInput, CategoryFilters } from '../types/category.types';

const KEYS = {
  all: ['categories'] as const,
  list: (f?: Partial<CategoryFilters>) => ['categories', 'list', f] as const,
  tree: () => ['categories', 'tree'] as const,
  detail: (id: string) => ['categories', id] as const,
};

export function useCategories(filters?: Partial<CategoryFilters>) {
  return useQuery({ queryKey: KEYS.list(filters), queryFn: () => categoryService.getAll(filters) });
}

export function useCategoryTree() {
  return useQuery({ queryKey: KEYS.tree(), queryFn: () => categoryService.getTree() });
}

export function useCategory(id: string) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => categoryService.getById(id), enabled: !!id });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCategoryInput> }) => categoryService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useCategoryActions() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => categoryService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  return { setStatus, remove };
}
