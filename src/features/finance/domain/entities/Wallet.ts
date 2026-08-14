import type { Money } from '../value-objects/Money';
import { WalletType } from '../enums/WalletType';

/**
 * Wallet — represents a financial account or cash position.
 *
 * Business rules:
 * - currentBalance is NEVER stored. It must always be calculated by
 *   summing all Completed transactions for this wallet.
 * - openingBalance is recorded once as an OpeningBalance transaction.
 * - isActive = false means the wallet is archived (soft delete principle).
 */
export interface Wallet {
  readonly id: string;
  readonly name: string;
  readonly type: WalletType;
  readonly currency: string;       // CurrencyCode — kept as string for serialization
  readonly isActive: boolean;
  readonly openingBalance: Money;

  readonly createdAt: string;      // ISO 8601 UTC
  readonly updatedAt: string;      // ISO 8601 UTC
  readonly createdBy: string;      // userId
  readonly isDeleted: boolean;     // soft delete only
}

export { WalletType };
