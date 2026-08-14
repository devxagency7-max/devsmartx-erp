export interface MonetaryAmount {
  amount: number;
  currencyCode: string;
}

export function formatCurrency(value: MonetaryAmount, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currencyCode,
  }).format(value.amount);
}
