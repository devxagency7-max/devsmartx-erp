import { useQuery } from '@tanstack/react-query';
import { currencyService } from '../services/currencyService';

const KEYS = { all: ['currencies'] as const };

export function useCurrencies() {
  return useQuery({ queryKey: KEYS.all, queryFn: () => currencyService.getAll() });
}
