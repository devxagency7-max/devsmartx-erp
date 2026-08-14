import type { ReactNode } from 'react';
import { ThemeSwitcher } from '@/shared/layout/ThemeSwitcher';
import { APP_NAME, APP_VERSION } from '@/shared/constants/app';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] px-4 py-12">
      {/* Theme switcher — top-right corner */}
      <div className="absolute right-4 top-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* Logo */}
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-[hsl(var(--primary))]">
            <img
              src="/logo.png"
              alt="DevSmartX ERP logo"
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).innerHTML =
                  '<span class="text-xl font-bold text-white select-none">DX</span>';
              }}
            />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">{APP_NAME}</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">v{APP_VERSION}</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
