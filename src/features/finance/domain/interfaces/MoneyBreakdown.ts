import type { Money } from '../value-objects/Money';
import type { TransactionType } from '../enums/TransactionType';

/**
 * MoneyBreakdown — categorized breakdown of money grouped by TransactionType.
 *
 * Used by summary widgets and reports. All values are derived from transactions.
 */
export interface MoneyBreakdown {
  readonly total: Money;
  readonly byType: Readonly<Record<TransactionType, Money>>;
  readonly periodStart: string;    // ISO 8601 UTC
  readonly periodEnd: string;      // ISO 8601 UTC
}
