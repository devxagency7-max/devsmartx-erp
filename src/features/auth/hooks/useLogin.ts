import { useState } from 'react';
import { authService } from '@/shared/services/auth/authService';
import { useAuthStore } from '@/shared/stores/authStore';
import { AuthenticationError } from '@/shared/errors/AuthenticationError';

interface LoginParams {
  email: string;
  password: string;
}

interface UseLoginResult {
  login: (params: LoginParams) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLogin(): UseLoginResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  async function login({ email, password }: LoginParams): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
      return true;
    } catch (err) {
      const message =
        err instanceof AuthenticationError
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error, clearError: () => setError(null) };
}
