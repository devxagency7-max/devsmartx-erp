import type { TransactionType } from '../enums/TransactionType';

/**
 * TransactionCategory — classifies transactions for reporting and filtering.
 *
 * System categories (isSystem = true) are seeded and cannot be deleted.
 * User-created categories can have a parent (parentCategoryId) for grouping.
 */
export interface TransactionCategory {
  readonly id: string;
  readonly name: string;
  readonly color: string;          // hex color e.g. '#EF4444'
  readonly icon: string;           // Lucide icon name e.g. 'ShoppingCart'
  readonly applicableTypes: readonly TransactionType[];
  readonly parentCategoryId: string | null;
  readonly isSystem: boolean;
  readonly isDeleted: boolean;

  readonly createdAt: string;      // ISO 8601 UTC
  readonly updatedAt: string;      // ISO 8601 UTC
}
