import type { TransactionRecord } from '@/features/finance/transactions/types/transaction.types';
import type { UploadResult } from '@/shared/upload';

/** Expense is a TransactionRecord with type === Expense. Re-exported for clarity. */
export type ExpenseRecord = TransactionRecord;

/** The 7-step wizard form state — all fields optional until the step is submitted. */
export interface ExpenseWizardState {
  // Step 1 — Category
  categoryId: string;
  categoryName: string;
  // Step 2 — Payment Source
  paymentSourceId: string;
  paymentSourceName: string;
  currency: string;
  // Step 3 — Payment
  paymentMethod: string;
  // Step 4 — Details
  amount: number | '';
  transactionDate: string;
  vendor: string;
  description: string;
  notes: string;
  // Step 5 — Attachments
  attachments: UploadResult[];
  // Steps 6–7 are Review + Confirmation (no additional fields)
}

export type ExpenseWizardStep =
  | 'category'
  | 'paymentSource'
  | 'payment'
  | 'details'
  | 'attachments'
  | 'review'
  | 'confirmation';

export const EXPENSE_WIZARD_STEPS: ExpenseWizardStep[] = [
  'category',
  'paymentSource',
  'payment',
  'details',
  'attachments',
  'review',
  'confirmation',
];

export interface ExpenseFilters {
  search: string;
  categoryId: string;
  paymentSourceId: string;
  status: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}
