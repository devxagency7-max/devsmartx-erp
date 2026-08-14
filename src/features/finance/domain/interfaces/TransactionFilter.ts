import type { TransactionType } from '../enums/TransactionType';
import type { TransactionStatus } from '../enums/TransactionStatus';
import type { PaymentMethod } from '../enums/PaymentMethod';

/**
 * TransactionFilter — query parameters for filtering transaction lists.
 *
 * All fields are optional. An empty filter returns all transactions.
 */
export interface TransactionFilter {
  readonly walletId?: string;
  readonly type?: TransactionType | TransactionType[];
  readonly status?: TransactionStatus | TransactionStatus[];
  readonly paymentMethod?: PaymentMethod;
  readonly categoryId?: string;
  readonly dateFrom?: string;       // ISO 8601 UTC
  readonly dateTo?: string;         // ISO 8601 UTC
  readonly amountMin?: number;
  readonly amountMax?: number;
  readonly search?: string;         // matches description or referenceNumber
  readonly createdBy?: string;      // userId
  readonly page?: number;
  readonly pageSize?: number;
}
