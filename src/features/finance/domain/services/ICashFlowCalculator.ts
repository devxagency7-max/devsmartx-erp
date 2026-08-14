import type { Transaction } from '../entities/Transaction';
import type { MoneyBreakdown } from '../interfaces/MoneyBreakdown';
import type { Money } from '../value-objects/Money';

/**
 * ICashFlowCalculator — derives income, expenses and net cash flow from transactions.
 *
 * Cash flow is never stored. It is always computed from the set of
 * Completed transactions for a given period. All values are derived.
 */
export interface ICashFlowCalculator {
  /**
   * Total inflows (Revenue + PartnerContribution + OpeningBalance)
   * for the given set of completed transactions.
   */
  totalInflow(completedTransactions: readonly Transaction[]): Money;

  /**
   * Total outflows (Expense + Transfer out + Refund)
   * for the given set of completed transactions.
   */
  totalOutflow(completedTransactions: readonly Transaction[]): Money;

  /**
   * Net cash flow = totalInflow − totalOutflow.
   */
  netCashFlow(completedTransactions: readonly Transaction[]): Money;

  /**
   * Full breakdown by TransactionType for a period.
   */
  breakdown(
    completedTransactions: readonly Transaction[],
    periodStart: string,  // ISO 8601 UTC
    periodEnd: string,    // ISO 8601 UTC
  ): MoneyBreakdown;
}
