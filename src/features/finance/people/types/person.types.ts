export type PersonType =
  | 'Partner'
  | 'Employee'
  | 'Contractor'
  | 'SupplierContact'
  | 'Other';

export type PersonStatus = 'Active' | 'Inactive' | 'Archived';

/** Who owes whom */
export type LedgerDirection =
  | 'PERSON_OWES_COMPANY'  // person owes money to the company (company is owed)
  | 'COMPANY_OWES_PERSON'; // company owes money to the person

export type LedgerEntryStatus = 'Pending' | 'Settled' | 'Cancelled';

export interface PersonRecord {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: PersonType;
  status: PersonStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonLedgerEntry {
  id: string;
  personId: string;
  direction: LedgerDirection;
  amount: number;
  currency: string;
  reason: string;
  categoryId: string | null;
  transactionId: string | null;
  relatedProjectId: string | null;
  reference: string;
  date: string;
  status: LedgerEntryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Derived balance per currency — never stored */
export interface PersonBalance {
  currency: string;
  /** Positive: person owes company. Negative: company owes person. */
  netAmount: number;
  direction: LedgerDirection | 'Settled';
}

export interface CreatePersonInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  type: PersonType;
  notes?: string;
}

export interface CreateLedgerEntryInput {
  personId: string;
  direction: LedgerDirection;
  amount: number;
  currency: string;
  reason: string;
  categoryId?: string | null;
  transactionId?: string | null;
  relatedProjectId?: string | null;
  date: string;
  notes?: string;
}

export interface CreateSettlementInput {
  personId: string;
  /** Settlement direction: paying person → Revenue; company paying person → Expense */
  settlementDirection: LedgerDirection;
  paymentSourceId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  categoryId: string;
  settledAt: string;
  notes?: string;
}

export interface PersonFilters {
  search: string;
  type: string;
  status: string;
}

export const DEFAULT_PERSON_FILTERS: PersonFilters = {
  search: '',
  type: '',
  status: '',
};
