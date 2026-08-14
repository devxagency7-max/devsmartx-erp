import type { Transaction } from '../entities/Transaction';
import type { LedgerEntry } from '../interfaces/LedgerEntry';

/**
 * ILedgerService — produces the ordered ledger for a wallet.
 *
 * The ledger is a chronological list of LedgerEntry records derived
 * from Completed transactions. It includes a running balance for each row.
 * Nothing is stored — the ledger is always computed on demand.
 */
export interface ILedgerService {
  /**
   * Builds the ledger for a wallet from its completed transactions,
   * sorted chronologically. Each entry includes the running balance.
   */
  buildLedger(
    walletId: string,
    completedTransactions: readonly Transaction[],
  ): LedgerEntry[];

  /**
   * Builds the ledger for a given date range (inclusive).
   */
  buildLedgerForPeriod(
    walletId: string,
    completedTransactions: readonly Transaction[],
    from: string,  // ISO 8601 UTC
    to: string,    // ISO 8601 UTC
  ): LedgerEntry[];
}
