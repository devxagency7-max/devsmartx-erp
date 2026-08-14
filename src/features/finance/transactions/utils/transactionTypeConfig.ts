import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type { TransactionTypeConfig } from '../types/transaction.types';

const DEFAULT: TransactionTypeConfig = {
  showDestinationPaymentSource: false,
  showPartner: false,
  showOriginalTransaction: false,
  requireDestinationPaymentSource: false,
  requirePartner: false,
  requireOriginalTransaction: false,
  isReadOnly: false,
};

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  [TransactionType.Expense]: { ...DEFAULT },
  [TransactionType.Revenue]: { ...DEFAULT },
  [TransactionType.Transfer]: {
    ...DEFAULT,
    showDestinationPaymentSource: true,
    requireDestinationPaymentSource: true,
  },
  [TransactionType.PartnerContribution]: {
    ...DEFAULT,
    showPartner: true,
    requirePartner: true,
  },
  [TransactionType.Refund]: {
    ...DEFAULT,
    showOriginalTransaction: true,
    requireOriginalTransaction: true,
  },
  [TransactionType.Adjustment]: { ...DEFAULT },
  [TransactionType.OpeningBalance]: {
    ...DEFAULT,
    isReadOnly: true,
  },
};

export function getTypeConfig(type: TransactionType): TransactionTypeConfig {
  return TRANSACTION_TYPE_CONFIG[type] ?? DEFAULT;
}
