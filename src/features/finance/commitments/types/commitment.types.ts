export type CommitmentFrequency =
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'SemiAnnual'
  | 'Yearly'
  | 'Custom';

export type CommitmentStatus =
  | 'Active'
  | 'Paused'
  | 'Completed'
  | 'Cancelled'
  | 'Expired';

export type CommitmentDueWindow =
  | 'Overdue'
  | 'DueToday'
  | 'DueSoon'
  | 'Upcoming'
  | 'Paid';

export interface RecurringCommitmentRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  defaultPaymentSourceId: string | null;
  defaultPaymentSourceName: string | null;
  defaultPaymentMethodId: string | null;
  amount: number;
  currency: string;
  frequency: CommitmentFrequency;
  startDate: string;
  nextDueDate: string;
  endDate: string | null;
  status: CommitmentStatus;
  vendorName: string;
  relatedProjectId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentPaymentRecord {
  id: string;
  commitmentId: string;
  transactionId: string | null;
  amount: number;
  currency: string;
  paidAt: string;
  status: 'Paid' | 'Partial' | 'Overpaid';
  notes: string;
}

export interface CreateCommitmentInput {
  name: string;
  description?: string;
  categoryId?: string | null;
  defaultPaymentSourceId?: string | null;
  defaultPaymentMethodId?: string | null;
  amount: number;
  currency: string;
  frequency: CommitmentFrequency;
  startDate: string;
  endDate?: string | null;
  vendorName?: string;
  relatedProjectId?: string | null;
  notes?: string;
}

export interface RecordCommitmentPaymentInput {
  commitmentId: string;
  paymentSourceId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  categoryId: string;
  paidAt: string;
  notes?: string;
}

export interface CommitmentFilters {
  search: string;
  status: string;
  frequency: string;
  dueWindow: string;
  currency: string;
}

export const DEFAULT_COMMITMENT_FILTERS: CommitmentFilters = {
  search: '',
  status: '',
  frequency: '',
  dueWindow: '',
  currency: '',
};

/** Days ahead that count as "due soon" */
export const DUE_SOON_DAYS = 7;
