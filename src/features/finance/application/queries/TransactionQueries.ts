import type { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import type { TransactionRecord } from '@/features/finance/transactions/types/transaction.types';

export interface GetTransactionByIdQuery {
  readonly _type: 'GetTransactionById';
  readonly transactionId: string;
}

export interface GetTransactionListQuery {
  readonly _type: 'GetTransactionList';
  readonly paymentSourceId?: string;
  readonly type?: TransactionType;
  readonly status?: TransactionStatus;
  readonly currency?: string;
  readonly categoryId?: string;
  readonly partnerId?: string;
  readonly tagIds?: string[];
  readonly costCenterId?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly amountMin?: number;
  readonly amountMax?: number;
  readonly search?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

/** DTO returned by transaction queries. */
export type TransactionDTO = TransactionRecord;

export interface TransactionListDTO {
  readonly items: TransactionDTO[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
