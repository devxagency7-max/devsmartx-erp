import type { MasterDataStatus } from '../../shared/types';

export interface PartnerRecord {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: MasterDataStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerInput {
  code: string;
  name: string;
  email: string;
  phone?: string;
}

export interface PartnerFilters {
  search: string;
  status: MasterDataStatus | '';
}
