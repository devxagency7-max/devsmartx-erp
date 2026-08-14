import type { CreateTransactionCommand } from '../commands/TransactionCommands';
import type { TransactionRecord, CurrencyCode } from '@/features/finance/transactions/types/transaction.types';
import type { TransactionDTO } from '../queries/TransactionQueries';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { generateReference } from '@/features/finance/transactions/utils/generateReference';

/**
 * Maps a CreateTransactionCommand to a new TransactionRecord (domain shape).
 * PaymentSource/category/partner names must be resolved by the use case before calling.
 */
export function commandToTransactionRecord(
  cmd: CreateTransactionCommand,
  id: string,
  resolvedNames: {
    paymentSourceName: string;
    destinationPaymentSourceName?: string;
    categoryName?: string;
    partnerName?: string;
  },
): TransactionRecord {
  const now = new Date().toISOString();
  return {
    id,
    referenceNumber: generateReference(cmd.type),
    type: cmd.type,
    status: TransactionStatus.Draft,
    paymentSourceId: cmd.paymentSourceId,
    paymentSourceName: resolvedNames.paymentSourceName,
    destinationPaymentSourceId: cmd.destinationPaymentSourceId ?? null,
    destinationPaymentSourceName: resolvedNames.destinationPaymentSourceName ?? null,
    partnerId: cmd.partnerId ?? null,
    partnerName: resolvedNames.partnerName ?? null,
    originalTransactionId: cmd.originalTransactionId ?? null,
    originalTransactionRef: null,
    amount: cmd.amount,
    currency: cmd.currency as CurrencyCode,
    paymentMethod: cmd.paymentMethod as PaymentMethod,
    categoryId: cmd.categoryId ?? null,
    categoryName: resolvedNames.categoryName ?? null,
    description: cmd.description,
    notes: cmd.notes ?? '',
    transactionDate: cmd.transactionDate,
    attachments: [],
    createdAt: now,
    updatedAt: now,
    createdBy: cmd.actorId,
    approvedBy: null,
  };
}

/** Maps a TransactionRecord to a TransactionDTO (currently identical — placeholder for future projection). */
export function recordToTransactionDTO(record: TransactionRecord): TransactionDTO {
  return { ...record };
}
