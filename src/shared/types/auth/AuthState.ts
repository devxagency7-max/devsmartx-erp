import type { AuthenticatedUser } from './AuthenticatedUser';

export type AuthState = {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
};
