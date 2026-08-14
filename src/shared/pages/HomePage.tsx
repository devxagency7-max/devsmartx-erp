import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/app/router/constants';

export function HomePage() {
  return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
}
