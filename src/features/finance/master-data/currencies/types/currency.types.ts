import type { MasterDataStatus } from '../../shared/types';

export interface CurrencyRecord {
  code: string;          // ISO 4217
  name: string;
  symbol: string;
  decimals: number;
  status: MasterDataStatus;
  isSystem: boolean;     // system currencies are read-only
}
