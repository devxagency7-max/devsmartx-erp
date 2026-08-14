import type { CurrencyRecord } from '../types/currency.types';

const _currencies: CurrencyRecord[] = [
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', decimals: 2, status: 'active', isSystem: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, status: 'active', isSystem: true },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, status: 'active', isSystem: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimals: 2, status: 'active', isSystem: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, status: 'active', isSystem: true },
];

export const currencyService = {
  async getAll(): Promise<CurrencyRecord[]> { return [..._currencies]; },
  async getByCode(code: string): Promise<CurrencyRecord | null> {
    return _currencies.find((c) => c.code === code) ?? null;
  },
};
