import type { Money } from '../value-objects/Money';
import type { TransactionType } from '../enums/TransactionType';

/**
 * LedgerEntry — a single line in the double-entry accounting ledger view.
 *
 * Debit/credit semantics:
 * - Revenue, Contribution, OpeningBalance → credit (increases balance)
 * - Expense, Transfer out, Refund → debit (decreases balance)
 * - Adjustment can be either depending on sign.
 *
 * runningBalance is derived — never stored.
 */
export interface LedgerEntry {
  readonly transactionId: string;
  readonly referenceNumber: string;
  readonly date: string;            // ISO 8601 UTC
  readonly description: string;
  readonly type: TransactionType;
  readonly debit: Money | null;
  readonly credit: Money | null;
  readonly runningBalance: Money;   // cumulative balance after this entry
}
