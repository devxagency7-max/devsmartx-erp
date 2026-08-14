import type { CurrencyCode } from '../types/transaction.types';

const LOCALE_MAP: Record<CurrencyCode, string> = {
  EGP: 'ar-EG',
  USD: 'en-US',
  EUR: 'en-DE',
  SAR: 'ar-SA',
  AED: 'ar-AE',
};

export function formatAmount(amount: number, currency: CurrencyCode): string {
  const locale = LOCALE_MAP[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
