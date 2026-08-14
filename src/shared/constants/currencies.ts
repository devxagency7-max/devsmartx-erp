export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  EGP: { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
