import type { MasterDataStatus } from '../../shared/types';

export interface CostCenterRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  status: MasterDataStatus;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCostCenterInput {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface CostCenterFilters {
  search: string;
  status: MasterDataStatus | '';
}
