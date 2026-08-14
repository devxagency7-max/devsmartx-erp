import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthenticatedUser } from '@/shared/types/auth/AuthenticatedUser';

/**
 * STORE BOUNDARY: Authentication
 * Owns: authenticated user identity, session loading state, auth errors
 * Does NOT own: company/tenant context, permissions, UI state, business data
 */

interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: AuthenticatedUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      reset: () => set(initialState),
    }),
    { name: 'AuthStore' },
  ),
);
