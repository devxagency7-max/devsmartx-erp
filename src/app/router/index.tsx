import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes, dashboardRoutes, openRoutes } from './routes';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { Spinner } from '@/shared/components/ui/spinner';

const DashboardLayout = lazy(() =>
  import('@/shared/layouts/dashboard/DashboardLayout').then((m) => ({
    default: m.DashboardLayout,
  })),
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function ContentLoader() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
}

const router = createBrowserRouter([
  // Public auth routes — redirect authenticated users away
  ...publicRoutes.map(({ path, Component }) => ({
    path,
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicRoute redirectTo={'/dashboard'}>
          <Component />
        </PublicRoute>
      </Suspense>
    ),
  })),

  // Authenticated dashboard shell — DashboardLayout wraps all dashboard children
  {
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <DashboardLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: dashboardRoutes.map(({ path, Component }) => ({
      path,
      element: (
        <Suspense fallback={<ContentLoader />}>
          <Component />
        </Suspense>
      ),
    })),
  },

  // Open routes (no auth guard)
  ...openRoutes.map(({ path, Component }) => ({
    path,
    element: (
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    ),
  })),
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
