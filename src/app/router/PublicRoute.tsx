import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/shared/stores/authStore';
import { ROUTE_PATHS } from './constants';

interface Props {
  children: ReactNode;
  // Optional override: redirect authenticated users to a specific path
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = ROUTE_PATHS.DASHBOARD }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return <div />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
