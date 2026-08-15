import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { navigationConfig } from './NavigationConfig';
import type { NavItem } from './NavigationConfig';
import { isFeatureEnabled } from '@/core/config/featureFlags';
import { cn } from '@/shared/lib/utils';
import { APP_NAME } from '@/shared/constants/app';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

function filterNavItems(items: NavItem[]): NavItem[] {
  return items
    .filter((item) => {
      if (item.featureFlag === null) return true;
      return isFeatureEnabled(item.featureFlag);
    })
    .map((item) => ({
      ...item,
      children: item.children ? filterNavItems(item.children) : undefined,
    }));
}

function groupNavItems(items: NavItem[]): Map<NavItem['group'], NavItem[]> {
  const order: NavItem['group'][] = ['main', 'modules', 'system'];
  const map = new Map<NavItem['group'], NavItem[]>(order.map((g) => [g, []]));
  for (const item of items) {
    map.get(item.group)!.push(item);
  }
  return map;
}

function hasActiveChild(item: NavItem, pathname: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) =>
      pathname.startsWith(child.path) ||
      (child.children ? hasActiveChild(child, pathname) : false),
  );
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const visibleItems = filterNavItems(navigationConfig);
  const grouped = groupNavItems(visibleItems);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of visibleItems) {
      if (item.children && hasActiveChild(item, location.pathname)) {
        initial.add(item.key);
        for (const child of item.children) {
          if (child.children && hasActiveChild(child, location.pathname)) {
            initial.add(child.key);
          }
        }
      }
    }
    return initial;
  });

  useEffect(() => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      for (const item of visibleItems) {
        if (item.children && hasActiveChild(item, location.pathname)) {
          next.add(item.key);
          for (const child of item.children) {
            if (child.children && hasActiveChild(child, location.pathname)) {
              next.add(child.key);
            }
          }
        }
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleKey = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const groupLabels: Record<NavItem['group'], string> = {
    main: '',
    modules: t('nav.modules'),
    system: t('nav.system'),
  };

  const navLabels: Record<string, string> = {
    dashboard: t('nav.dashboard'),
    finance: t('nav.finance'),
    financeOverview: t('nav.financeOverview'),
    paymentSources: t('nav.paymentSources'),
    transactions: t('nav.transactions'),
    expenses: t('nav.expenses'),
    revenues: t('nav.revenues'),
    commitments: t('nav.commitments'),
    people: t('nav.people'),
    masterData: t('nav.masterData'),
    categories: t('nav.categories'),
    tags: t('nav.tags'),
    paymentMethods: t('nav.paymentMethods'),
    partners: t('nav.partners'),
    costCenters: t('nav.costCenters'),
    currencies: t('nav.currencies'),
    crm: t('nav.crm'),
    customers: t('nav.customers'),
    offers: t('nav.offers'),
    projects: t('nav.projects'),
    assets: t('nav.assets'),
    reports: t('nav.reports'),
    settings: t('nav.settings'),
    users: t('nav.users'),
    permissions: t('nav.permissions'),
  };

  function renderNavItem(item: NavItem, depth = 0): React.ReactNode {
    const itemLabel = navLabels[item.key] ?? item.label;
    const hasChildren = !!(item.children && item.children.length > 0);
    const isExpanded = expandedKeys.has(item.key);
    const isChildActive = hasChildren ? hasActiveChild(item, location.pathname) : false;

    if (hasChildren) {
      return (
        <div key={item.key}>
          <button
            type="button"
            onClick={() => !collapsed && toggleKey(item.key)}
            title={collapsed ? itemLabel : undefined}
            aria-label={itemLabel}
            aria-expanded={collapsed ? undefined : isExpanded}
            className={cn(
              'flex w-full items-center rounded-lg px-2 py-2 text-sm transition-all duration-150',
              collapsed ? 'justify-center' : 'gap-3',
              isChildActive
                ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 font-medium'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
            )}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-start">{itemLabel}</span>
                {item.badge && (
                  <span className="shrink-0 rounded-full bg-[hsl(var(--primary))]/10 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
                    {item.badge}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={cn(
                    'shrink-0 transition-transform duration-200',
                    isExpanded ? 'rotate-180' : '',
                  )}
                />
              </>
            )}
          </button>

          {!collapsed && (
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className={cn('mt-0.5 space-y-0.5', depth === 0 ? 'ps-4' : 'ps-3')}>
                {item.children!.map((child) => renderNavItem(child, depth + 1))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.key}
        to={item.path}
        end={item.path === '/dashboard'}
        title={collapsed ? itemLabel : undefined}
        aria-label={itemLabel}
        className={({ isActive }) =>
          cn(
            'flex items-center rounded-lg px-2 py-2 text-sm transition-all duration-150',
            collapsed ? 'justify-center' : 'gap-3',
            isActive
              ? 'bg-[hsl(var(--primary))] text-white font-medium shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
          )
        }
      >
        <item.icon size={depth > 0 ? 15 : 18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{itemLabel}</span>
            {item.badge && (
              <span className="shrink-0 rounded-full bg-[hsl(var(--primary))]/10 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-[width] duration-200 ease-in-out',
        'border-e border-[hsl(var(--border))] bg-[hsl(var(--card))]',
        'shadow-[1px_0_4px_0_rgb(0,0,0,0.06)] dark:shadow-none',
        collapsed ? 'w-16' : 'w-64',
      )}
      aria-label={t('nav.dashboard')}
    >
      {/* Logo row */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-[hsl(var(--border))]',
          collapsed ? 'justify-center px-0' : 'gap-3 px-4',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[hsl(var(--primary))] shadow-sm">
          <img
            src="/logo.png"
            alt={APP_NAME}
            className="h-full w-full object-contain p-0.5"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.parentElement as HTMLElement).innerHTML =
                '<span class="text-xs font-bold text-white select-none">DX</span>';
            }}
          />
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
            {APP_NAME}
          </span>
        )}
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {Array.from(grouped.entries()).map(([group, items]) => {
          if (items.length === 0) return null;
          const label = groupLabels[group];

          return (
            <div key={group} className="space-y-0.5">
              {label && !collapsed && (
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                  {label}
                </p>
              )}
              {label && collapsed && (
                <div className="mx-2 mb-2 border-t border-[hsl(var(--border))]" />
              )}
              {items.map((item) => renderNavItem(item))}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-[hsl(var(--border))] p-2">
        <button
          onClick={onToggle}
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          className={cn(
            'flex w-full items-center justify-center rounded-lg p-2',
            'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
            'transition-colors duration-150',
          )}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </aside>
  );
}
