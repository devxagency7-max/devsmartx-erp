import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ArrowLeftRight, Clock,
  CalendarClock, CreditCard, ShoppingCart, ReceiptText,
  Users, LayoutDashboard, PlusCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/shared/stores/authStore';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ROUTE_PATHS } from '@/app/router/constants';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import type { CurrencyCode } from '@/shared/types/currency';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

function getGreeting(t: (k: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('dashboard.greeting_morning');
  if (hour < 17) return t('dashboard.greeting_afternoon');
  return t('dashboard.greeting_evening');
}

function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  currency,
  isCount = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  currency?: CurrencyCode;
  isCount?: boolean;
}) {
  const formatted = isCount
    ? String(value)
    : formatAmount(value, currency ?? 'EGP');

  const trendColor =
    trend === 'up'
      ? 'text-[hsl(var(--success))]'
      : trend === 'down'
        ? 'text-[hsl(var(--destructive))]'
        : 'text-[hsl(var(--muted-foreground))]';

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {label}
            </p>
            <p className={`mt-1 text-xl font-bold tracking-tight truncate ${trendColor}`}>
              {formatted}
            </p>
          </div>
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10">
            <Icon size={18} className="text-[hsl(var(--primary))]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardHomePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { setItems } = useBreadcrumb();
  const firstName = (user?.displayName ?? user?.email ?? '').split(/[\s@]/)[0];
  const greeting = getGreeting(t);

  const {
    isLoading,
    totalRevenue,
    totalExpenses,
    netFlow,
    pendingCount,
    upcomingCommitments,
    recentTransactions,
  } = useDashboardMetrics();

  useEffect(() => {
    setItems([{ label: t('nav.dashboard') }]);
  }, [setItems, t]);

  const maxFlow = Math.max(totalRevenue, totalExpenses, 1);
  const revenueBarPct = Math.round((totalRevenue / maxFlow) * 100);
  const expensesBarPct = Math.round((totalExpenses / maxFlow) * 100);

  return (
    <div className="space-y-6">
      {/* Row 1: Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
            {firstName ? `${greeting}, ${firstName}` : greeting}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Row 2: KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label={t('dashboard.kpi_total_revenue')}
            value={totalRevenue}
            icon={TrendingUp}
            trend="up"
          />
          <KpiCard
            label={t('dashboard.kpi_total_expenses')}
            value={totalExpenses}
            icon={TrendingDown}
            trend="neutral"
          />
          <KpiCard
            label={t('dashboard.kpi_net_flow')}
            value={netFlow}
            icon={ArrowLeftRight}
            trend={netFlow >= 0 ? 'up' : 'down'}
          />
          <KpiCard
            label={t('dashboard.kpi_pending_transactions')}
            value={pendingCount}
            icon={Clock}
            isCount
          />
        </div>
      )}

      {/* Row 3: Financial Flow (2/3) + Quick Actions (1/3) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Financial Flow Card */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {t('dashboard.flow_chart_title')}
              </p>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {t('dashboard.this_month')}
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 rounded" />
                <Skeleton className="h-8 rounded" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Revenue bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-[hsl(var(--foreground))]">
                      {t('dashboard.flow_income')}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[hsl(var(--success))]">
                      {formatAmount(totalRevenue, 'EGP')}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-2.5 rounded-full bg-[hsl(var(--success))] transition-all duration-500"
                      style={{ width: `${revenueBarPct}%` }}
                    />
                  </div>
                </div>
                {/* Expenses bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-[hsl(var(--foreground))]">
                      {t('dashboard.flow_expenses')}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[hsl(var(--destructive))]">
                      {formatAmount(totalExpenses, 'EGP')}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-2.5 rounded-full bg-[hsl(var(--destructive))] transition-all duration-500"
                      style={{ width: `${expensesBarPct}%` }}
                    />
                  </div>
                </div>
                {totalRevenue === 0 && totalExpenses === 0 && (
                  <p className="text-center text-xs text-[hsl(var(--muted-foreground))] pt-2">
                    {t('dashboard.no_transactions')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
              {t('dashboard.quick_actions')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ShoppingCart, labelKey: 'dashboard.new_expense', path: ROUTE_PATHS.EXPENSES_NEW },
                { icon: ReceiptText, labelKey: 'dashboard.new_transaction', path: ROUTE_PATHS.TRANSACTIONS_NEW },
                { icon: CalendarClock, labelKey: 'dashboard.new_commitment', path: ROUTE_PATHS.COMMITMENTS_NEW },
                { icon: CreditCard, labelKey: 'dashboard.view_payment_sources', path: ROUTE_PATHS.PAYMENT_SOURCES },
                { icon: Users, labelKey: 'dashboard.view_people', path: ROUTE_PATHS.PEOPLE },
                { icon: LayoutDashboard, labelKey: 'dashboard.view_overview', path: ROUTE_PATHS.FINANCE_OVERVIEW },
              ].map(({ icon: Icon, labelKey, path }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-3 text-center text-xs font-medium text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--primary))]/5 active:scale-[0.98]"
                >
                  <Icon size={16} className="text-[hsl(var(--primary))]" />
                  <span className="leading-tight">{t(labelKey)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Upcoming Commitments + Recent Transactions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Commitments */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {t('dashboard.upcoming_commitments')}
              </p>
              <Link
                to={ROUTE_PATHS.COMMITMENTS}
                className="text-xs text-[hsl(var(--primary))] hover:underline"
              >
                {t('dashboard.view_all')}
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded" />
                ))}
              </div>
            ) : upcomingCommitments.length === 0 ? (
              <EmptyState
                title={t('dashboard.no_commitments')}
                description=""
                action={
                  <Link
                    to={ROUTE_PATHS.COMMITMENTS_NEW}
                    className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:underline"
                  >
                    <PlusCircle size={12} />
                    {t('commitment.addNew')}
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {upcomingCommitments.slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                        {c.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {c.nextDueDate}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold text-[hsl(var(--foreground))]">
                      {formatAmount(c.amount, c.currency as CurrencyCode)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {t('dashboard.recent_transactions')}
              </p>
              <Link
                to={ROUTE_PATHS.TRANSACTIONS}
                className="text-xs text-[hsl(var(--primary))] hover:underline"
              >
                {t('dashboard.view_all')}
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <EmptyState
                title={t('dashboard.no_transactions')}
                description=""
                action={
                  <Link
                    to={ROUTE_PATHS.TRANSACTIONS_NEW}
                    className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--primary))] hover:underline"
                  >
                    <PlusCircle size={12} />
                    {t('transaction.newTransaction')}
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {recentTransactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                        {tx.referenceNumber}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {tx.transactionDate}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="font-mono text-sm font-semibold text-[hsl(var(--foreground))]">
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                      <Badge
                        variant={
                          tx.type === 'Revenue' ? 'success' :
                          tx.type === 'Expense' ? 'destructive' : 'secondary'
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {tx.type}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
