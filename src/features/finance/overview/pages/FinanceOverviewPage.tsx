import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ROUTE_PATHS } from '@/app/router/constants';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import type { CurrencyCode } from '@/shared/types/currency';
import { useFinanceOverview } from '../hooks/useFinanceOverview';

export default function FinanceOverviewPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const {
    isLoading,
    allTimeRevenue,
    allTimeExpenses,
    allTimeNet,
    sourcesSummary,
    topCategories,
    maxCategoryTotal,
  } = useFinanceOverview();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE_OVERVIEW },
      { label: t('financeOverview.title') },
    ]);
  }, [setItems, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('financeOverview.title')}
        description={t('financeOverview.subtitle')}
      />

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    {t('financeOverview.all_time_revenue')}
                  </p>
                  <p className="mt-1 text-xl font-bold text-[hsl(var(--success))]">
                    {formatAmount(allTimeRevenue, 'SAR')}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--success))]/10">
                  <TrendingUp size={18} className="text-[hsl(var(--success))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    {t('financeOverview.all_time_expenses')}
                  </p>
                  <p className="mt-1 text-xl font-bold text-[hsl(var(--destructive))]">
                    {formatAmount(allTimeExpenses, 'SAR')}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--destructive))]/10">
                  <TrendingDown size={18} className="text-[hsl(var(--destructive))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    {t('financeOverview.all_time_net')}
                  </p>
                  <p className={`mt-1 text-xl font-bold ${allTimeNet >= 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}`}>
                    {formatAmount(allTimeNet, 'SAR')}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10">
                  <ArrowLeftRight size={18} className="text-[hsl(var(--primary))]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* By Payment Source */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
            {t('financeOverview.by_source')}
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          ) : sourcesSummary.filter((s) => s.txCount > 0).length === 0 ? (
            <EmptyState
              title={t('financeOverview.no_data')}
              description=""
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="pb-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('paymentSource.name')}
                    </th>
                    <th className="pb-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('paymentSource.currency')}
                    </th>
                    <th className="pb-3 text-end text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('financeOverview.tx_count')}
                    </th>
                    <th className="pb-3 text-end text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('financeOverview.total_in')}
                    </th>
                    <th className="pb-3 text-end text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('financeOverview.total_out')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {sourcesSummary
                    .filter((s) => s.txCount > 0)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-[hsl(var(--muted))]/50 transition-colors">
                        <td className="py-3 font-medium text-[hsl(var(--foreground))]">{s.name}</td>
                        <td className="py-3 text-[hsl(var(--muted-foreground))]">{s.currency}</td>
                        <td className="py-3 text-end text-[hsl(var(--muted-foreground))]">{s.txCount}</td>
                        <td className="py-3 text-end font-mono text-[hsl(var(--success))]">
                          {formatAmount(s.totalIn, s.currency)}
                        </td>
                        <td className="py-3 text-end font-mono text-[hsl(var(--destructive))]">
                          {formatAmount(s.totalOut, s.currency)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
            {t('financeOverview.by_category')}
          </p>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded" />
              ))}
            </div>
          ) : topCategories.length === 0 ? (
            <EmptyState
              title={t('financeOverview.no_data')}
              description=""
            />
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat) => {
                const pct = Math.round((cat.total / maxCategoryTotal) * 100);
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {cat.name}
                      </span>
                      <span className="text-sm font-mono text-[hsl(var(--destructive))]">
                        {formatAmount(cat.total, cat.currency as CurrencyCode)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-2 rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
