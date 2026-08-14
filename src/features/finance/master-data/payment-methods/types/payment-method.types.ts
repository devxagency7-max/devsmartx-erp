import type { MasterDataStatus } from '../../shared/types';

export interface PaymentMethodRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  status: MasterDataStatus;
  isSystem: boolean;       // system methods cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodInput {
  code: string;
  name: string;
  description?: string;
}
