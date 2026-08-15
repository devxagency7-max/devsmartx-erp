import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { TransactionStatusBadge } from '@/features/finance/transactions/components/TransactionStatusBadge';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import type { CurrencyCode } from '@/shared/types/currency';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getExpenseExportColumns } from '../export/expenseExportColumns';
import { useExpenseStore } from '../store/expenseStore';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseFiltersBar } from '../components/ExpenseFiltersBar';
import { ExpenseActionsMenu } from '../components/ExpenseActionsMenu';

export function ExpenseListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { expenses, isLoading, isError, error, refetch } = useExpenses();
  const filters = useExpenseStore((s) => s.filters);
  const { exportData, isExporting } = useExcelExport();

  const hasFilters = Object.values(filters).some((v) => v !== '');

  const buildExportConfig = useCallback(
    (data: typeof expenses, mode: 'all' | 'filtered') => ({
      fileName: generateFileName('Expenses', mode, new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('expense.title')),
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
    await exportData(buildExportConfig(expenses, 'all'));
  }, [exportData, expenses, buildExportConfig]);

  const handleExportFiltered = useCallback(async () => {
    await exportData(buildExportConfig(expenses, 'filtered'));
  }, [exportData, expenses, buildExportConfig]);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('nav.transactions'), path: ROUTE_PATHS.TRANSACTIONS },
      { label: t('expense.title') },
    ]);
  }, [setItems, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('expense.title')}
        description={t('expense.description')}
        actions={
          <>
            <ExportButton
              onExportAll={handleExportAll}
              onExportFiltered={hasFilters ? handleExportFiltered : undefined}
              hasFilters={hasFilters}
              isDisabled={expenses.length === 0}
              isExporting={isExporting}
            />
            <Button onClick={() => navigate(ROUTE_PATHS.EXPENSES_NEW)}>
              {t('expense.newExpense')}
            </Button>
          </>
        }
      />

      <ExpenseFiltersBar />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && <ErrorState error={error as Error} onRetry={refetch} />}

      {!isLoading && !isError && expenses.length === 0 && (
        <EmptyState
          title={t('expense.empty')}
          action={
            <Button onClick={() => navigate(ROUTE_PATHS.EXPENSES_NEW)}>
              {t('expense.newExpense')}
            </Button>
          }
        />
      )}

      {!isLoading && !isError && expenses.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.referenceNumber')}</th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.description')}</th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.category')}</th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.paymentSource')}</th>
                    <th className="px-4 py-3 text-right font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.amount')}</th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.paymentMethod')}</th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.status')}</th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">{t('transaction.transactionDate')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 cursor-pointer"
                      onClick={() => navigate(ROUTE_PATHS.EXPENSE_DETAILS.replace(':id', exp.id))}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{exp.referenceNumber}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-foreground">{exp.description || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{exp.categoryName ?? '—'}</td>
                      <td className="px-4 py-3">{exp.paymentSourceName}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatAmount(exp.amount, exp.currency as CurrencyCode)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{t(`transaction.pm_${exp.paymentMethod}`)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <TransactionStatusBadge status={exp.status} />
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{exp.transactionDate}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <ExpenseActionsMenu id={exp.id} status={exp.status} />
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

export default ExpenseListPage;
