import type { CurrencyCode } from '@/shared/types/currency';

export type PaymentSourceStatus = 'active' | 'inactive' | 'archived';

export enum PaymentSourceType {
  BankAccount = 'BankAccount',
  Cash = 'Cash',
  PettyCash = 'PettyCash',
  CreditCard = 'CreditCard',
  DigitalWallet = 'DigitalWallet',
  PartnerAccount = 'PartnerAccount',
  Other = 'Other',
}

export interface PaymentSourceRecord {
  id: string;
  code: string;
  name: string;
  type: PaymentSourceType;
  currency: CurrencyCode;
  status: PaymentSourceStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSourceFilters {
  search: string;
  type: PaymentSourceType | '';
  currency: CurrencyCode | '';
  status: PaymentSourceStatus | '';
}

export interface CreatePaymentSourceInput {
  name: string;
  type: PaymentSourceType;
  currency: CurrencyCode;
  description?: string;
}

export interface EditPaymentSourceInput {
  name: string;
  type: PaymentSourceType;
  description?: string;
}
