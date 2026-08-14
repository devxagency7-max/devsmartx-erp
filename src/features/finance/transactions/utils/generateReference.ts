import { TransactionType } from '@/features/finance/domain/enums/TransactionType';

const PREFIX: Record<TransactionType, string> = {
  [TransactionType.Expense]:             'EXP',
  [TransactionType.Revenue]:             'REV',
  [TransactionType.Transfer]:            'TRF',
  [TransactionType.PartnerContribution]: 'PCT',
  [TransactionType.Refund]:              'RFD',
  [TransactionType.Adjustment]:          'ADJ',
  [TransactionType.OpeningBalance]:      'OPN',
};

/** Generates a reference number: PREFIX-YYYYMMDD-XXXXX */
export function generateReference(type: TransactionType): string {
  const prefix = PREFIX[type] ?? 'TXN';
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${datePart}-${random}`;
}
