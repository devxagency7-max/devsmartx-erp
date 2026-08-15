import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ErrorState } from '@/shared/components/ui/error-state';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { SectionHeader } from '@/shared/components/ui/section-header';
import { Separator } from '@/shared/components/ui/separator';
import { PageHeader } from '@/shared/components/ui/page-header';
import { Badge } from '@/shared/components/ui/badge';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { TransactionStatusBadge } from '@/features/finance/transactions/components/TransactionStatusBadge';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import type { CurrencyCode } from '@/shared/types/currency';
import { useExpense } from '../hooks/useExpense';
import { ExpenseActionsMenu } from '../components/ExpenseActionsMenu';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function ExpenseDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { expense: exp, isLoading, isError, error } = useExpense(id ?? '');
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('expense.title'), path: ROUTE_PATHS.EXPENSES },
      { label: exp?.referenceNumber ?? '…' },
    ]);
  }, [setItems, t, exp?.referenceNumber]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) return <ErrorState error={error as Error} />;
  if (!exp) {
    return (
      <EmptyState
        title={t('expense.errors.notFound')}
        action={
          <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.EXPENSES)}>
            <ArrowLeft size={14} className="mr-1" />
            {t('common.back')}
          </Button>
        }
      />
    );
  }

  const isEditable = exp.status === TransactionStatus.Draft;

  return (
    <div className="space-y-6">
      <PageHeader
        title={exp.referenceNumber}
        description={exp.description}
        actions={
          <div className="flex items-center gap-2">
            {isEditable && (
              <Button
                variant="outline"
                onClick={() => navigate(ROUTE_PATHS.EXPENSE_EDIT.replace(':id', exp.id))}
              >
                <Pencil size={14} className="mr-1" />
                {t('common.actions.edit')}
              </Button>
            )}
            <ExpenseActionsMenu id={exp.id} status={exp.status} />
          </div>
        }
      />

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader title={t('transaction.summary')} />
          <div className="divide-y divide-[hsl(var(--border))]">
            <DetailRow label={t('transaction.status')} value={<TransactionStatusBadge status={exp.status} />} />
            <DetailRow label={t('transaction.amount')} value={formatAmount(exp.amount, exp.currency as CurrencyCode)} />
            <DetailRow label={t('transaction.currency')} value={exp.currency} />
            <DetailRow label={t('transaction.paymentSource')} value={exp.paymentSourceName} />
            <DetailRow label={t('transaction.paymentMethod')} value={<Badge variant="outline">{t(`transaction.pm_${exp.paymentMethod}`)}</Badge>} />
            <DetailRow label={t('transaction.transactionDate')} value={exp.transactionDate} />
            {exp.description && (
              <DetailRow label={t('transaction.description')} value={<span className="text-end max-w-xs truncate">{exp.description}</span>} />
            )}
            {exp.notes && (
              <DetailRow label={t('transaction.notes')} value={<span className="text-end max-w-xs truncate">{exp.notes}</span>} />
            )}
            {exp.partnerId && exp.partnerName && (
              <DetailRow label={t('transaction.partner')} value={exp.partnerName} />
            )}
            <DetailRow label={t('transaction.createdAt')} value={new Date(exp.createdAt).toLocaleDateString('ar-EG')} />
            {exp.approvedBy && <DetailRow label={t('transaction.approvedBy')} value={exp.approvedBy} />}
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader title={t('transaction.attachments')} />
          {exp.attachments.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('transaction.attachmentsPlaceholder')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {exp.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate rounded border border-[hsl(var(--border))] p-2 text-xs hover:bg-[hsl(var(--muted))]"
                >
                  {a.fileName}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline placeholder */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader title={t('transaction.timeline')} />
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Clock className="h-4 w-4" />
            <span>{t('transaction.timelinePlaceholder')}</span>
          </div>
        </CardContent>
      </Card>

      <Separator />
      <Button variant="ghost" onClick={() => navigate(ROUTE_PATHS.EXPENSES)}>
        <ArrowLeft size={14} className="mr-1" />
        {t('common.back')}
      </Button>
    </div>
  );
}

export default ExpenseDetailsPage;
