import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  CreditCard,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  CalendarClock,
  Users,
  Database,
  Tag,
  UserCheck,
  Target,
  Coins,
  Search,
  X,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/app/router/constants';
import { cn } from '@/shared/lib/utils';

interface CommandItem {
  key: string;
  labelKey: string;
  path: string;
  icon: React.ElementType;
  group: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', path: ROUTE_PATHS.DASHBOARD, icon: LayoutDashboard, group: 'main' },
  { key: 'financeOverview', labelKey: 'nav.financeOverview', path: ROUTE_PATHS.FINANCE_OVERVIEW, icon: LayoutDashboard, group: 'finance' },
  { key: 'paymentSources', labelKey: 'nav.paymentSources', path: ROUTE_PATHS.PAYMENT_SOURCES, icon: CreditCard, group: 'finance' },
  { key: 'transactions', labelKey: 'nav.transactions', path: ROUTE_PATHS.TRANSACTIONS, icon: ReceiptText, group: 'finance' },
  { key: 'expenses', labelKey: 'nav.expenses', path: ROUTE_PATHS.EXPENSES, icon: ShoppingCart, group: 'finance' },
  { key: 'revenues', labelKey: 'nav.revenues', path: ROUTE_PATHS.REVENUES, icon: TrendingUp, group: 'finance' },
  { key: 'commitments', labelKey: 'nav.commitments', path: ROUTE_PATHS.COMMITMENTS, icon: CalendarClock, group: 'finance' },
  { key: 'people', labelKey: 'nav.people', path: ROUTE_PATHS.PEOPLE, icon: Users, group: 'finance' },
  { key: 'categories', labelKey: 'nav.categories', path: ROUTE_PATHS.CATEGORIES, icon: Tag, group: 'masterData' },
  { key: 'tags', labelKey: 'nav.tags', path: ROUTE_PATHS.TAGS, icon: Tag, group: 'masterData' },
  { key: 'partners', labelKey: 'nav.partners', path: ROUTE_PATHS.PARTNERS, icon: UserCheck, group: 'masterData' },
  { key: 'costCenters', labelKey: 'nav.costCenters', path: ROUTE_PATHS.COST_CENTERS, icon: Target, group: 'masterData' },
  { key: 'currencies', labelKey: 'nav.currencies', path: ROUTE_PATHS.CURRENCIES, icon: Coins, group: 'masterData' },
  { key: 'masterData', labelKey: 'nav.masterData', path: ROUTE_PATHS.CATEGORIES, icon: Database, group: 'masterData' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandDialog({ open, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? COMMAND_ITEMS.filter((item) =>
        t(item.labelKey).toLowerCase().includes(query.toLowerCase()),
      )
    : COMMAND_ITEMS;

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleSelect(item: CommandItem) {
    navigate(item.path);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  if (!open) return null;

  const isRtl = i18n.dir() === 'rtl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      aria-modal="true"
      role="dialog"
      aria-label={t('common.search')}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden"
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
          <Search size={16} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('common.search') + '…'}
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
          />
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              {t('common.noData')}
            </p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.key}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(item)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  idx === activeIndex
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
                )}
              >
                <item.icon size={15} className="shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-[hsl(var(--border))] px-4 py-2 flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
          <span><kbd className="rounded border border-[hsl(var(--border))] px-1 font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="rounded border border-[hsl(var(--border))] px-1 font-mono">↵</kbd> open</span>
          <span><kbd className="rounded border border-[hsl(var(--border))] px-1 font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
