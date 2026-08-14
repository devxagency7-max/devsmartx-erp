import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type { MasterDataStatus } from '../../shared/types';

export type { MasterDataStatus };

export interface CategoryRecord {
  id: string;
  code: string;
  name: string;
  color: string;           // hex e.g. '#EF4444'
  icon: string;            // Lucide icon name
  parentId: string | null;
  parentName: string | null;
  description: string;
  status: MasterDataStatus;
  isSystem: boolean;
  sortOrder: number;
  applicableTypes: TransactionType[];
  createdAt: string;
  updatedAt: string;
}

/** Recursive tree node for CategoryTree component. */
export interface CategoryTreeNode extends CategoryRecord {
  children: CategoryTreeNode[];
}

export interface CreateCategoryInput {
  code: string;
  name: string;
  color: string;
  icon: string;
  parentId?: string;
  description?: string;
  sortOrder: number;
  applicableTypes: TransactionType[];
}

export interface CategoryFilters {
  search: string;
  status: MasterDataStatus | '';
  parentId?: string;
}
