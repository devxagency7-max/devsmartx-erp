import type { Transaction } from '../entities/Transaction';
import type { Money } from '../value-objects/Money';
import type { BalanceSnapshot } from '../interfaces/BalanceSnapshot';

/**
 * IBalanceCalculator — derives wallet balances from transactions.
 *
 * Business rule: balance is NEVER stored. It is always computed from
 * the set of Completed transactions belonging to a wallet.
 *
 * Draft, Pending, Cancelled, and Rejected transactions are excluded
 * from all balance calculations.
 */
export interface IBalanceCalculator {
  /**
   * Computes the current balance of a wallet from its completed transactions.
   */
  computeBalance(walletId: string, completedTransactions: readonly Transaction[]): Money;

  /**
   * Produces a full BalanceSnapshot including credit/debit totals.
   */
  computeSnapshot(walletId: string, completedTransactions: readonly Transaction[]): BalanceSnapshot;

  /**
   * Determines the net monetary effect of a single transaction.
   * Returns positive for inflows, negative for outflows.
   */
  transactionEffect(transaction: Transaction): Money;
}
