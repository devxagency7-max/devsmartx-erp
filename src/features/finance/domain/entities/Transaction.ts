import type { Money } from '../value-objects/Money';
import { TransactionType } from '../enums/TransactionType';
import { TransactionStatus } from '../enums/TransactionStatus';
import { PaymentMethod } from '../enums/PaymentMethod';

export interface TransactionAttachmentRef {
  id: string;
  url: string;
  fileName: string;
}

/**
 * Transaction — the single source of truth for every financial event.
 *
 * Business rules:
 * - Only Completed transactions affect wallet balances.
 * - Draft / Pending / Cancelled / Rejected have zero balance impact.
 * - referenceNumber must be unique per company.
 * - amount is always a Money value object, never a raw number.
 * - Every transaction belongs to exactly one wallet (walletId).
 */
export interface Transaction {
  readonly id: string;
  readonly referenceNumber: string;

  readonly walletId: string;
  readonly type: TransactionType;
  readonly status: TransactionStatus;

  readonly amount: Money;
  readonly paymentMethod: PaymentMethod;

  readonly description: string;
  readonly notes: string | null;

  readonly categoryId: string | null;
  readonly attachments: readonly TransactionAttachmentRef[];

  readonly createdAt: string;   // ISO 8601 UTC
  readonly updatedAt: string;   // ISO 8601 UTC
  readonly createdBy: string;   // userId
  readonly approvedBy: string | null; // userId
  readonly completedAt: string | null; // ISO 8601 UTC
}

export { TransactionType, TransactionStatus, PaymentMethod };
