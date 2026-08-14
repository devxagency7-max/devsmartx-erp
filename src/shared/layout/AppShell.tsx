import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Content } from './Content';
import { Footer } from './Footer';
import { cn } from '@/shared/lib/utils';

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileSidebarOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-[hsl(var(--background))]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-200',
          mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar drawer — slides from the inline-start (right in RTL) */}
      <div
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex md:hidden transition-transform duration-200',
          mobileSidebarOpen
            ? 'translate-x-0'
            : 'ltr:-translate-x-full rtl:translate-x-full',
        )}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setMobileSidebarOpen((v) => !v)} />
        <Content>{children}</Content>
        <Footer />
      </div>
    </div>
  );
}
