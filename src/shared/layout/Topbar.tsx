import { useState, useEffect } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Breadcrumb } from './Breadcrumb';
import { useBreadcrumb } from './BreadcrumbContext';
import { LanguageSwitcher } from '@/shared/i18n/components/LanguageSwitcher';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useAuthStore } from '@/shared/stores/authStore';
import { authService } from '@/shared/services/auth/authService';
import { CommandDialog } from '@/shared/components/CommandDialog';

interface Props {
  onMenuClick: () => void;
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

export function Topbar({ onMenuClick }: Props) {
  const { t } = useTranslation();
  const { items } = useBreadcrumb();
  const user = useAuthStore((s) => s.user);
  const reset = useAuthStore((s) => s.reset);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  async function handleLogout() {
    await authService.signOut();
    reset();
  }

  const initials = getInitials(user?.displayName, user?.email);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur-sm px-4">
        {/* Left: mobile menu + breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label={t('nav.openMenu')}
            className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] md:hidden"
          >
            <Menu size={18} />
          </button>

          {items.length > 0 && (
            <div className="hidden sm:block">
              <Breadcrumb items={items} />
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* ⌘K search pill (desktop) */}
          <button
            onClick={() => setCommandOpen(true)}
            aria-label={t('common.search')}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <Search size={13} />
            <span>{t('common.search')}</span>
            <kbd className="ms-1 hidden lg:inline-flex rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>

          {/* Search icon (mobile) */}
          <button
            onClick={() => setCommandOpen(true)}
            aria-label={t('common.search')}
            className="flex sm:hidden items-center justify-center rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <Search size={16} />
          </button>

          <button
            aria-label={t('common.notifications')}
            title={t('common.notifications')}
            className="flex items-center justify-center rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            <Bell size={16} />
          </button>

          <LanguageSwitcher />
          <ThemeSwitcher />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={t('nav.userMenu')}
                className="ms-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-medium bg-[hsl(var(--primary))] text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user?.email && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem disabled>{t('common.profile')}</DropdownMenuItem>
              <DropdownMenuItem disabled>{t('common.settings')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                onSelect={handleLogout}
              >
                {t('common.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
