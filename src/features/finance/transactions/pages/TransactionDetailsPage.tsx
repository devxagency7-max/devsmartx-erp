import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, X, Download, FileText } from 'lucide-react';
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

interface AttachmentPreview {
  fileUrl: string;
  fileName: string;
  mimeType: string;
}

export function TransactionDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<AttachmentPreview | null>(null);
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
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label={t('transaction.referenceNumber')} value={<span className="font-mono text-xs">{tx.referenceNumber}</span>} />
            <InfoRow label={t('transaction.paymentSource')} value={tx.paymentSourceName} />
            {tx.destinationPaymentSourceName && (
              <InfoRow label={t('transaction.destinationPaymentSource')} value={tx.destinationPaymentSourceName} />
            )}
            <InfoRow label={t('transaction.paymentMethod')} value={t(`transaction.pm_${tx.paymentMethod}`)} />
            <InfoRow label={t('transaction.transactionDate')} value={tx.transactionDate} />
            <InfoRow label={t('transaction.description')} value={tx.description || '—'} />
            {tx.notes && <InfoRow label={t('transaction.notes')} value={tx.notes} />}
          </dl>
        </CardContent>
      </Card>

      {/* Partner Contributions */}
      {tx.partnerContributions && tx.partnerContributions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <SectionHeader title="مساهمات الشركاء" className="pb-4" />
            <Separator className="mb-4" />
            {(() => {
              const total = tx.partnerContributions.reduce((s, c) => s + c.amount, 0);
              const equalShare = Math.round((tx.amount / tx.partnerContributions.length) * 100) / 100;
              return (
                <div className="space-y-2">
                  {tx.partnerContributions.map((c) => {
                    const diff = Math.round((c.amount - equalShare) * 100) / 100;
                    return (
                      <div key={c.personId} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">{c.personName}</span>
                          <span className="font-mono text-sm font-semibold text-[hsl(var(--foreground))]">
                            {formatAmount(c.amount, tx.currency)}
                          </span>
                        </div>
                        {diff !== 0 && (
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                              نصيبه {formatAmount(equalShare, tx.currency)}
                            </span>
                            <span className={`text-xs font-medium ${diff > 0 ? 'text-green-500' : 'text-destructive'}`}>
                              {diff > 0
                                ? `دفع زيادة ${formatAmount(diff, tx.currency)} ← الشركة مدينة له`
                                : `عليه ${formatAmount(Math.abs(diff), tx.currency)} للشركة`}
                            </span>
                          </div>
                        )}
                        {diff === 0 && (
                          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">دفع نصيبه كامل</p>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-1 pt-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">إجمالي المساهمات</span>
                    <span className="font-mono text-sm font-bold text-[hsl(var(--foreground))]">
                      {formatAmount(total, tx.currency)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

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
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => setPreview({ fileUrl: att.fileUrl, fileName: att.fileName, mimeType: att.mimeType })}
                    className="group flex flex-col overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 hover:border-[hsl(var(--primary))]/60 hover:shadow-md transition-all text-start"
                  >
                    {isImage ? (
                      <img src={att.fileUrl} alt={att.fileName} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 w-full flex-col items-center justify-center gap-2 bg-[hsl(var(--muted))]/50">
                        <FileText size={32} className="text-[hsl(var(--primary))]/60" />
                        <span className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                          {att.mimeType?.split('/')[1] ?? 'file'}
                        </span>
                      </div>
                    )}
                    <div className="px-2 py-1.5">
                      <span className="block truncate text-xs text-[hsl(var(--foreground))]">{att.fileName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl w-full rounded-xl overflow-hidden bg-[hsl(var(--card))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
              <span className="truncate text-sm font-medium text-[hsl(var(--foreground))]">{preview.fileName}</span>
              <div className="flex items-center gap-2">
                <a
                  href={preview.fileUrl}
                  download={preview.fileName}
                  className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-white hover:bg-[hsl(var(--primary))]/90 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={13} /> تحميل
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center overflow-auto p-4" style={{ maxHeight: 'calc(90vh - 56px)' }}>
              {preview.mimeType?.startsWith('image/') ? (
                <img src={preview.fileUrl} alt={preview.fileName} className="max-h-full max-w-full rounded-lg object-contain" />
              ) : preview.mimeType === 'application/pdf' ? (
                <iframe src={preview.fileUrl} title={preview.fileName} className="h-[70vh] w-full rounded-lg border-0" />
              ) : (
                <div className="flex flex-col items-center gap-4 py-12">
                  <FileText size={64} className="text-[hsl(var(--muted-foreground))]" />
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">لا يمكن عرض هذا النوع من الملفات</p>
                  <a
                    href={preview.fileUrl}
                    download={preview.fileName}
                    className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--primary))]/90"
                  >
                    <Download size={15} /> تحميل الملف
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
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
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
