import type { Money } from '../value-objects/Money';
import type { TransactionType } from '../enums/TransactionType';
import type { TransactionStatus } from '../enums/TransactionStatus';

/**
 * TransactionSummary — lightweight projection of a Transaction for list views.
 *
 * Used by query hooks and list components. Never used for balance calculation.
 */
export interface TransactionSummary {
  readonly id: string;
  readonly referenceNumber: string;
  readonly walletId: string;
  readonly walletName: string;
  readonly type: TransactionType;
  readonly status: TransactionStatus;
  readonly amount: Money;
  readonly description: string;
  readonly categoryName: string | null;
  readonly createdAt: string;       // ISO 8601 UTC
  readonly completedAt: string | null;
}
