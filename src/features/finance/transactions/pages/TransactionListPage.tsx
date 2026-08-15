import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReceiptText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getTransactionExportColumns } from '../export/transactionExportColumns';
import { useTransactionStore } from '../store/transactionStore';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionFiltersBar } from '../components/TransactionFiltersBar';
import { TransactionTypeBadge } from '../components/TransactionTypeBadge';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { TransactionActionsMenu } from '../components/TransactionActionsMenu';
import { formatAmount } from '../utils/formatAmount';

export function TransactionListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { transactions, isLoading, isError, error, refetch } = useTransactions();
  const filters = useTransactionStore((s) => s.filters);
  const { exportData, isExporting } = useExcelExport();

  const hasFilters = Object.values(filters).some((v) => v !== '');

  const buildExportConfig = useCallback(
    (data: typeof transactions, mode: 'all' | 'filtered') => ({
      fileName: generateFileName('Transactions', mode, new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('transaction.title')),
      data,
      columns: getTransactionExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: mode,
    }),
    [t, i18n],
  );

  const handleExportAll = useCallback(async () => {
    await exportData(buildExportConfig(transactions, 'all'));
  }, [exportData, transactions, buildExportConfig]);

  const handleExportFiltered = useCallback(async () => {
    await exportData(buildExportConfig(transactions, 'filtered'));
  }, [exportData, transactions, buildExportConfig]);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('transaction.title') },
    ]);
  }, [setItems, t]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('transaction.title')}
        description={t('transaction.moduleDescription')}
        actions={
          <>
            <ExportButton
              onExportAll={handleExportAll}
              onExportFiltered={hasFilters ? handleExportFiltered : undefined}
              hasFilters={hasFilters}
              isDisabled={transactions.length === 0}
              isExporting={isExporting}
            />
            <Button onClick={() => navigate(ROUTE_PATHS.TRANSACTIONS_NEW)}>
              {t('transaction.newTransaction')}
            </Button>
          </>
        }
      />

      <TransactionFiltersBar />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && <ErrorState error={error as Error} onRetry={() => void refetch()} />}

      {!isLoading && !isError && transactions.length === 0 && (
        <EmptyState
          icon={ReceiptText}
          title={t('transaction.noTransactions')}
          description={t('transaction.noTransactionsDesc')}
          action={
            <Button onClick={() => navigate(ROUTE_PATHS.TRANSACTIONS_NEW)}>
              {t('transaction.newTransaction')}
            </Button>
          }
        />
      )}

      {!isLoading && !isError && transactions.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
                      {t('transaction.referenceNumber')}
                    </th>
                    <th className="hidden px-4 py-3 text-start font-medium text-[hsl(var(--muted-foreground))] sm:table-cell">
                      {t('transaction.description')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
                      {t('transaction.type')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
                      {t('transaction.paymentSource')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-[hsl(var(--muted-foreground))]">
                      {t('transaction.amount')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
                      {t('transaction.status')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[hsl(var(--muted-foreground))]">
                      {t('transaction.transactionDate')}
                    </th>
                    <th className="w-10 px-2 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="cursor-pointer border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/30 transition-colors last:border-0"
                      onClick={() => navigate(`${ROUTE_PATHS.TRANSACTIONS}/${tx.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                        {tx.referenceNumber}
                      </td>
                      <td className="hidden px-4 py-3 max-w-[200px] sm:table-cell">
                        <span className="block truncate text-[hsl(var(--foreground))]">{tx.description || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <TransactionTypeBadge type={tx.type} />
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--foreground))]">
                        {tx.paymentSourceName}
                        {tx.destinationPaymentSourceName && (
                          <span className="text-[hsl(var(--muted-foreground))]">
                            {' → '}{tx.destinationPaymentSourceName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatAmount(tx.amount, tx.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <TransactionStatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {tx.transactionDate}
                      </td>
                      <td
                        className="px-2 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TransactionActionsMenu transaction={tx} />
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
