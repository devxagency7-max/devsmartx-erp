import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shared/layout/Sidebar';
import { Topbar } from '@/shared/layout/Topbar';
import { Footer } from '@/shared/layout/Footer';
import { BreadcrumbProvider } from '@/shared/layout/BreadcrumbContext';
import { useSidebarCollapse } from '@/shared/layout/hooks/useSidebarCollapse';
import { cn } from '@/shared/lib/utils';

export function DashboardLayout() {
  const { collapsed, toggle } = useSidebarCollapse();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:shrink-0">
          <Sidebar collapsed={collapsed} onToggle={toggle} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex md:hidden transition-transform duration-200',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onMenuClick={() => setMobileSidebarOpen((v) => !v)} />

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
