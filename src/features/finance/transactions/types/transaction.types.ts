import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import type { CurrencyCode } from '@/shared/types/currency';

export type { CurrencyCode };
export { TransactionType, TransactionStatus, PaymentMethod };

/** Flat record shape used in the UI layer (no Money VO — plain numbers). */
export interface TransactionRecord {
  id: string;
  referenceNumber: string;

  type: TransactionType;
  status: TransactionStatus;

  paymentSourceId: string;
  paymentSourceName: string;
  destinationPaymentSourceId: string | null;   // Transfer only
  destinationPaymentSourceName: string | null; // Transfer only

  partnerId: string | null;             // PartnerContribution only
  partnerName: string | null;

  originalTransactionId: string | null; // Refund only
  originalTransactionRef: string | null;

  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;

  categoryId: string | null;
  categoryName: string | null;

  description: string;
  notes: string;

  attachments: AttachmentRef[];

  transactionDate: string;  // YYYY-MM-DD
  createdAt: string;        // ISO 8601 UTC
  updatedAt: string;
  createdBy: string;
  approvedBy: string | null;
}

export interface AttachmentRef {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

export interface PartnerContributionEntry {
  personId: string;
  personName: string;
  amount: number;
}

/** Shape used by the create/edit form. */
export interface TransactionFormInput {
  type: TransactionType;
  paymentSourceId: string;
  destinationPaymentSourceId: string;
  partnerId: string;
  originalTransactionId: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  categoryId: string;
  description: string;
  notes: string;
  transactionDate: string;
  partnerContributions?: PartnerContributionEntry[];
}

/** Filters for the transaction list. */
export interface TransactionFilters {
  search: string;
  type: TransactionType | '';
  paymentSourceId: string;
  status: TransactionStatus | '';
  currency: CurrencyCode | '';
  paymentMethod: PaymentMethod | '';
  categoryId: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

/** Which fields are visible/required per transaction type. */
export interface TransactionTypeConfig {
  showDestinationPaymentSource: boolean;
  showPartner: boolean;
  showOriginalTransaction: boolean;
  requireDestinationPaymentSource: boolean;
  requirePartner: boolean;
  requireOriginalTransaction: boolean;
  isReadOnly: boolean;
}
