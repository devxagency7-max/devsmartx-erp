/** Common status used across all master data entities. */
export type MasterDataStatus = 'active' | 'inactive';

/** Minimal option shape for dropdowns/selects. */
export interface SelectOption {
  id: string;
  name: string;
}
