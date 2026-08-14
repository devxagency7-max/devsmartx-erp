import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { TransactionStatusBadge } from '@/features/finance/transactions/components/TransactionStatusBadge';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getExpenseExportColumns } from '../../expense/export/expenseExportColumns';
import { useRevenues } from '../hooks/useRevenues';
import { useRevenueStore } from '../store/revenueStore';

export default function RevenueListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { revenues, isLoading, isError, error, refetch } = useRevenues();
  const filters = useRevenueStore((s) => s.filters);
  const setFilters = useRevenueStore((s) => s.setFilters);
  const resetFilters = useRevenueStore((s) => s.resetFilters);
  const { exportData, isExporting } = useExcelExport();

  const hasFilters = Object.values(filters).some((v) => v !== '');

  const buildExportConfig = useCallback(
    (data: typeof revenues, mode: 'all' | 'filtered') => ({
      fileName: generateFileName('Revenue', mode, new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('workflow.revenue.title')),
      data,
      columns: getExpenseExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: mode,
    }),
    [t, i18n],
  );

  const handleExportAll = useCallback(async () => {
    await exportData(buildExportConfig(revenues, 'all'));
  }, [exportData, revenues, buildExportConfig]);

  const handleExportFiltered = useCallback(async () => {
    await exportData(buildExportConfig(revenues, 'filtered'));
  }, [exportData, revenues, buildExportConfig]);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE_OVERVIEW },
      { label: t('nav.revenues') },
    ]);
  }, [setItems, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('workflow.revenue.title')}
        description={t('workflow.revenue.description')}
        actions={
          <>
            <ExportButton
              onExportAll={handleExportAll}
              onExportFiltered={hasFilters ? handleExportFiltered : undefined}
              hasFilters={hasFilters}
              isDisabled={revenues.length === 0}
              isExporting={isExporting}
            />
            <Button onClick={() => navigate(ROUTE_PATHS.REVENUES_NEW)}>
              {t('workflow.revenue.submit')}
            </Button>
          </>
        }
      />

      {/* Simple search filter */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder={t('transaction.filters.searchPlaceholder')}
          className="h-9 w-full max-w-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2"
        />
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] underline-offset-2 hover:underline"
          >
            {t('transaction.filters.clearFilters')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error as Error} onRetry={refetch} />
      ) : revenues.length === 0 ? (
        <EmptyState
          title={t('transaction.noTransactions')}
          description={t('transaction.noTransactionsDesc')}
          action={
            <Button onClick={() => navigate(ROUTE_PATHS.REVENUES_NEW)}>
              {t('workflow.revenue.submit')}
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('transaction.referenceNumber')}
                    </th>
                    <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:table-cell">
                      {t('transaction.category')}
                    </th>
                    <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] md:table-cell">
                      {t('transaction.paymentSource')}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('transaction.amount')}
                    </th>
                    <th className="hidden px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] lg:table-cell">
                      {t('transaction.status')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {t('transaction.transactionDate')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {revenues.map((rev) => (
                    <tr
                      key={rev.id}
                      className="cursor-pointer hover:bg-[hsl(var(--muted))]/50 transition-colors"
                      onClick={() => navigate(ROUTE_PATHS.TRANSACTION_DETAILS.replace(':id', rev.id))}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--foreground))]">
                        {rev.referenceNumber}
                      </td>
                      <td className="hidden px-4 py-3 text-[hsl(var(--muted-foreground))] sm:table-cell">
                        {rev.categoryName ?? '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-[hsl(var(--muted-foreground))] md:table-cell">
                        {rev.paymentSourceName}
                      </td>
                      <td className="px-4 py-3 text-end font-mono font-semibold text-[hsl(var(--success))]">
                        {formatAmount(rev.amount, rev.currency)}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <TransactionStatusBadge status={rev.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {rev.transactionDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
