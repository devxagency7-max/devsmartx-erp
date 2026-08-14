import { Currency } from './Currency';
import type { CurrencyCode } from './Currency';

/**
 * Immutable value object representing a monetary amount with its currency.
 *
 * All arithmetic is performed in integer subunits (e.g. cents) to avoid
 * floating-point rounding errors. Results are always rounded to the
 * currency's decimal precision.
 *
 * Business rule: Raw numbers must NEVER represent money directly — always
 * use Money.of() to construct a monetary value.
 */
export class Money {
  readonly amount: number;
  readonly currency: Currency;

  private constructor(amount: number, currency: Currency) {
    // Round to the currency's decimal precision to prevent floating-point drift
    const factor = Math.pow(10, currency.decimals);
    this.amount = Math.round(amount * factor) / factor;
    this.currency = currency;
  }

  static of(amount: number, currencyCode: CurrencyCode): Money {
    return new Money(amount, Currency.of(currencyCode));
  }

  static zero(currencyCode: CurrencyCode): Money {
    return new Money(0, Currency.of(currencyCode));
  }

  // ── Arithmetic ────────────────────────────────────────────────────────────

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) throw new Error('Money: division by zero');
    return new Money(this.amount / divisor, this.currency);
  }

  abs(): Money {
    return new Money(Math.abs(this.amount), this.currency);
  }

  negate(): Money {
    return new Money(-this.amount, this.currency);
  }

  // ── Comparison ────────────────────────────────────────────────────────────

  equals(other: Money): boolean {
    return this.currency.equals(other.currency) && this.amount === other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  // ── Formatting ────────────────────────────────────────────────────────────

  format(locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency.code,
      minimumFractionDigits: this.currency.decimals,
      maximumFractionDigits: this.currency.decimals,
    }).format(this.amount);
  }

  toNumber(): number {
    return this.amount;
  }

  toString(): string {
    return `${this.amount} ${this.currency.code}`;
  }

  // ── Guard ─────────────────────────────────────────────────────────────────

  private assertSameCurrency(other: Money): void {
    if (!this.currency.equals(other.currency)) {
      throw new Error(
        `Money: currency mismatch — cannot operate on ${this.currency.code} and ${other.currency.code}`,
      );
    }
  }
}
