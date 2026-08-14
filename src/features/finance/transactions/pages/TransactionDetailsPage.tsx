import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Paperclip, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ErrorState } from '@/shared/components/ui/error-state';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { SectionHeader } from '@/shared/components/ui/section-header';
import { Separator } from '@/shared/components/ui/separator';
import { PageHeader } from '@/shared/components/ui/page-header';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { useTransaction } from '../hooks/useTransaction';
import { TransactionTypeBadge } from '../components/TransactionTypeBadge';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { TransactionActionsMenu } from '../components/TransactionActionsMenu';
import { formatAmount } from '../utils/formatAmount';

export function TransactionDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { transaction: tx, isLoading, isError, error } = useTransaction(id ?? '');
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('transaction.title'), path: ROUTE_PATHS.TRANSACTIONS },
      { label: tx?.referenceNumber ?? '…' },
    ]);
  }, [setItems, t, tx?.referenceNumber]);

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

  if (!tx) {
    return (
      <EmptyState
        title={t('transaction.errors.notFound')}
        action={
          <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.TRANSACTIONS)}>
            <ArrowLeft size={14} className="mr-1" />
            {t('common.back')}
          </Button>
        }
      />
    );
  }

  const isTerminal =
    tx.status === TransactionStatus.Completed ||
    tx.status === TransactionStatus.Cancelled ||
    tx.status === TransactionStatus.Rejected;

  return (
    <div className="space-y-6">
      <PageHeader
        title={tx.referenceNumber}
        description={t(`transaction.type_${tx.type}`)}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTE_PATHS.TRANSACTIONS)}>
              <ArrowLeft size={14} className="mr-1" />
              {t('common.back')}
            </Button>
            {!isTerminal && tx.type !== TransactionType.OpeningBalance && (
              <Button
                size="sm"
                onClick={() => navigate(`${ROUTE_PATHS.TRANSACTIONS}/${tx.id}/edit`)}
              >
                <Pencil size={14} className="mr-1" />
                {t('transaction.actions.edit')}
              </Button>
            )}
            <TransactionActionsMenu transaction={tx} />
          </div>
        }
      />

      {/* Summary card */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader title={t('transaction.summary')} className="pb-4" />
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('transaction.amount')}</p>
              <p className="text-2xl font-bold tabular-nums text-[hsl(var(--foreground))]">
                {formatAmount(tx.amount, tx.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('transaction.type')}</p>
              <TransactionTypeBadge type={tx.type} className="mt-1" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('transaction.status')}</p>
              <div className="mt-1">
                <TransactionStatusBadge status={tx.status} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details card */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader title={t('transaction.transactionDetails')} className="pb-4" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <InfoRow label={t('transaction.referenceNumber')} value={<span className="font-mono text-xs">{tx.referenceNumber}</span>} />
            <InfoRow label={t('transaction.paymentSource')} value={tx.paymentSourceName} />
            {tx.destinationPaymentSourceName && (
              <InfoRow label={t('transaction.destinationPaymentSource')} value={tx.destinationPaymentSourceName} />
            )}
            <InfoRow label={t('transaction.paymentMethod')} value={t(`transaction.pm_${tx.paymentMethod}`)} />
            <InfoRow label={t('transaction.category')} value={tx.categoryName ?? '—'} />
            <InfoRow label={t('transaction.transactionDate')} value={tx.transactionDate} />
            <InfoRow label={t('transaction.description')} value={tx.description} />
            {tx.notes && <InfoRow label={t('transaction.notes')} value={tx.notes} />}
          </dl>
        </CardContent>
      </Card>

      {/* Attachments */}
      {tx.attachments && tx.attachments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <SectionHeader title={t('transaction.attachments')} className="pb-4" />
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tx.attachments.map((att) => {
                const isImage = att.mimeType?.startsWith('image/');
                return (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 hover:border-[hsl(var(--primary))]/50 transition-colors"
                  >
                    {isImage ? (
                      <img
                        src={att.fileUrl}
                        alt={att.fileName}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center">
                        <Paperclip size={28} className="text-[hsl(var(--muted-foreground))]" />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                      <span className="truncate text-xs text-[hsl(var(--foreground))]">{att.fileName}</span>
                      <ExternalLink size={11} className="shrink-0 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline placeholder */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader title={t('transaction.timeline')} className="pb-4" />
          <Separator className="mb-4" />
          <p className="text-sm text-center text-[hsl(var(--muted-foreground))] py-6">
            {t('transaction.timelinePlaceholder')}
          </p>
        </CardContent>
      </Card>

      {/* Audit */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader title={t('paymentSource.auditInfo')} className="pb-4" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <InfoRow label={t('transaction.createdAt')} value={new Date(tx.createdAt).toLocaleString()} />
            <InfoRow label={t('transaction.updatedAt')} value={new Date(tx.updatedAt).toLocaleString()} />
            <InfoRow label={t('transaction.createdBy')} value={tx.createdBy} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-[hsl(var(--muted-foreground))]">{label}</dt>
      <dd className="font-medium text-[hsl(var(--foreground))]">{value}</dd>
    </div>
  );
}
