import type { MasterDataStatus } from '../../shared/types';

export interface TagRecord {
  id: string;
  name: string;
  color: string;
  description: string;
  status: MasterDataStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagInput {
  name: string;
  color: string;
  description?: string;
}

export interface TagFilters {
  search: string;
  status: MasterDataStatus | '';
}
