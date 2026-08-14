import type { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';

/** Base for all transaction-mutating commands. */
interface TransactionCommandBase {
  readonly actorId: string;
  readonly correlationId?: string;
}

export interface CreateTransactionCommand extends TransactionCommandBase {
  readonly _type: 'CreateTransaction';
  readonly type: TransactionType;
  readonly paymentSourceId: string;
  readonly destinationPaymentSourceId?: string;
  readonly partnerId?: string;
  readonly originalTransactionId?: string;
  readonly amount: number;
  readonly currency: string;
  readonly paymentMethod: string;
  readonly categoryId?: string;
  readonly description: string;
  readonly notes?: string;
  readonly transactionDate: string;       // ISO 8601 date
  readonly tagIds?: string[];
  readonly costCenterId?: string;
}

export interface UpdateTransactionCommand extends TransactionCommandBase {
  readonly _type: 'UpdateTransaction';
  readonly transactionId: string;
  /** Partial — only provided fields are updated. Transaction must be in Draft. */
  readonly patch: Partial<Omit<CreateTransactionCommand, '_type' | 'actorId' | 'correlationId'>>;
}

export interface SubmitTransactionCommand extends TransactionCommandBase {
  readonly _type: 'SubmitTransaction';
  readonly transactionId: string;
  readonly reason?: string;
}

export interface ApproveTransactionCommand extends TransactionCommandBase {
  readonly _type: 'ApproveTransaction';
  readonly transactionId: string;
  readonly reason?: string;
}

export interface RejectTransactionCommand extends TransactionCommandBase {
  readonly _type: 'RejectTransaction';
  readonly transactionId: string;
  readonly reason: string;
}

export interface CancelTransactionCommand extends TransactionCommandBase {
  readonly _type: 'CancelTransaction';
  readonly transactionId: string;
  readonly reason: string;
}

export interface ReverseTransactionCommand extends TransactionCommandBase {
  readonly _type: 'ReverseTransaction';
  readonly transactionId: string;
  readonly reason: string;
}

export interface DuplicateTransactionCommand extends TransactionCommandBase {
  readonly _type: 'DuplicateTransaction';
  readonly transactionId: string;
  readonly newDate?: string;
}

export type TransactionCommand =
  | CreateTransactionCommand
  | UpdateTransactionCommand
  | SubmitTransactionCommand
  | ApproveTransactionCommand
  | RejectTransactionCommand
  | CancelTransactionCommand
  | ReverseTransactionCommand
  | DuplicateTransactionCommand;

/** Discriminator helper. */
export type TransactionCommandType = TransactionCommand['_type'];

export type { TransactionStatus };
