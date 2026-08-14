import type { ReactNode } from 'react';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { AppErrorBoundary } from '@/shared/errors/AppErrorBoundary';
import { QueryProvider } from '@/shared/lib/react-query/QueryProvider';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { I18nProvider } from './I18nProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';

interface Props {
  children: ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppErrorBoundary>
          <QueryProvider>
            <TooltipProvider>
              <AuthProvider>
                <ToastProvider />
                {children}
              </AuthProvider>
            </TooltipProvider>
          </QueryProvider>
        </AppErrorBoundary>
      </ThemeProvider>
    </I18nProvider>
  );
}
