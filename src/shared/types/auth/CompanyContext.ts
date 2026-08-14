import type { UserRole } from './UserRole';

export type CompanyContext = {
  companyId: string;
  companyName: string;
  role: UserRole;
  // Extended in future phases: plan, currency, timezone, enabledModules, permissions
};
