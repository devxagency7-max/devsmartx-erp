export const SUPPORTED_CURRENCIES = ['EGP', 'USD', 'EUR', 'SAR', 'AED'] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_META: Record<CurrencyCode, { name: string; symbol: string; decimals: number }> = {
  EGP: { name: 'Egyptian Pound', symbol: 'ج.م', decimals: 2 },
  USD: { name: 'US Dollar', symbol: '$', decimals: 2 },
  EUR: { name: 'Euro', symbol: '€', decimals: 2 },
  SAR: { name: 'Saudi Riyal', symbol: 'ر.س', decimals: 2 },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
};

export class Currency {
  readonly code: CurrencyCode;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;

  private constructor(code: CurrencyCode) {
    this.code = code;
    this.name = CURRENCY_META[code].name;
    this.symbol = CURRENCY_META[code].symbol;
    this.decimals = CURRENCY_META[code].decimals;
  }

  static of(code: CurrencyCode): Currency {
    return new Currency(code);
  }

  static isSupported(code: string): code is CurrencyCode {
    return SUPPORTED_CURRENCIES.includes(code as CurrencyCode);
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }
}
