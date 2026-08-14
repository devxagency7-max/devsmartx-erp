import type { Transaction } from '../entities/Transaction';
import type { TransactionFilter } from '../interfaces/TransactionFilter';
import type { TransactionSummary } from '../interfaces/TransactionSummary';

/**
 * ITransactionEngine — the primary entry point for all financial operations.
 *
 * Every financial action in the system (record expense, log revenue,
 * transfer funds, adjust balance) must go through this engine.
 * No component or hook may bypass it to write financial data directly.
 *
 * Implementation will live in the service layer (not in this domain file).
 */
export interface ITransactionEngine {
  /**
   * Records a new financial transaction.
   * Assigns a unique referenceNumber and sets status to Draft.
   */
  record(data: Omit<Transaction, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;

  /**
   * Submits a Draft transaction for approval (moves to Pending).
   */
  submit(transactionId: string): Promise<Transaction>;

  /**
   * Marks a Pending transaction as Completed.
   * Only Completed transactions affect wallet balances.
   */
  complete(transactionId: string, approvedBy: string): Promise<Transaction>;

  /**
   * Cancels a Draft or Pending transaction.
   * Cancelled transactions have zero balance impact.
   */
  cancel(transactionId: string, reason: string): Promise<Transaction>;

  /**
   * Rejects a Pending transaction.
   */
  reject(transactionId: string, rejectedBy: string, reason: string): Promise<Transaction>;

  /**
   * Queries transactions with optional filtering and pagination.
   */
  query(filter: TransactionFilter): Promise<TransactionSummary[]>;

  /**
   * Retrieves a single transaction by ID.
   */
  getById(transactionId: string): Promise<Transaction | null>;
}
