import { useState } from 'react';
import type { ReactNode } from 'react';
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

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex md:hidden transition-transform duration-200',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileSidebarOpen((v) => !v)} />
        <Content>{children}</Content>
        <Footer />
      </div>
    </div>
  );
}
