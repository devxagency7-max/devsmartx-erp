import type { Money } from '../value-objects/Money';

/**
 * BalanceSnapshot — a point-in-time derived view of a wallet's balance.
 *
 * Never persisted. Always computed by BalanceCalculator from transactions.
 */
export interface BalanceSnapshot {
  readonly walletId: string;
  readonly balance: Money;
  readonly totalCredits: Money;    // sum of inflows (Revenue, Contribution, etc.)
  readonly totalDebits: Money;     // sum of outflows (Expense, Transfer out, etc.)
  readonly transactionCount: number;
  readonly asOf: string;           // ISO 8601 UTC — when this snapshot was computed
}
