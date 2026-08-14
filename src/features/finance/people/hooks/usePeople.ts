import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personService } from '../services/personService';
import type {
  PersonFilters,
  CreatePersonInput,
  CreateLedgerEntryInput,
  CreateSettlementInput,
} from '../types/person.types';

const KEYS = {
  all: ['people'] as const,
  list: (f?: Partial<PersonFilters>) => ['people', 'list', f] as const,
  detail: (id: string) => ['people', id] as const,
  ledger: (id: string) => ['people', id, 'ledger'] as const,
  balances: (id: string) => ['people', id, 'balances'] as const,
};

export function usePeople(filters?: Partial<PersonFilters>) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => personService.getAll(filters),
    staleTime: 30_000,
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => personService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function usePersonLedger(personId: string) {
  return useQuery({
    queryKey: KEYS.ledger(personId),
    queryFn: () => personService.getLedgerEntries(personId),
    enabled: !!personId,
    staleTime: 30_000,
  });
}

export function usePersonBalances(personId: string) {
  return useQuery({
    queryKey: KEYS.balances(personId),
    queryFn: () => personService.getLedgerBalances(personId),
    enabled: !!personId,
    staleTime: 30_000,
  });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePersonInput) => personService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreatePersonInput> }) =>
      personService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useAddLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLedgerEntryInput) => personService.addLedgerEntry(input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.ledger(vars.personId) });
      qc.invalidateQueries({ queryKey: KEYS.balances(vars.personId) });
    },
  });
}

export function useCreateSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSettlementInput) => personService.createSettlement(input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.ledger(vars.personId) });
      qc.invalidateQueries({ queryKey: KEYS.balances(vars.personId) });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function usePersonActions() {
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Active' | 'Inactive' | 'Archived' }) =>
      personService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => personService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
  return { setStatus, remove };
}
