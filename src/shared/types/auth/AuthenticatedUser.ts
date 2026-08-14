import type { CompanyContext } from './CompanyContext';

export type AuthenticatedUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Populated after company selection in a future phase
  companyContext: CompanyContext | null;
};
