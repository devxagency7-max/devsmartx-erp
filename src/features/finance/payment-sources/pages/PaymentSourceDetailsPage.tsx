import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { Button } from '@/shared/components/ui/button';
import { usePaymentSource, usePaymentSourceActions } from '../hooks/usePaymentSources';

const STATUS_CLASSES: Record<string, string> = {
  active:   'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  inactive: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
  archived: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
};

export default function PaymentSourceDetailsPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: ps, isLoading } = usePaymentSource(id);
  const actions = usePaymentSourceActions();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('paymentSource.title'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: ps?.name ?? '…' },
    ]);
  }, [setItems, t, ps]);

  const handleAction = async (action: 'activate' | 'deactivate' | 'archive' | 'delete') => {
    if (action === 'delete' && !window.confirm(t('paymentSource.actions.confirmDelete'))) return;
    try {
      await actions.mutateAsync({ id, action });
      toast.success(t('common.save'));
      if (action === 'delete') navigate(ROUTE_PATHS.PAYMENT_SOURCES);
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
        ))}
      </div>
    );
  }

  if (!ps) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{t('paymentSource.errors.notFound')}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCES)}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCES)}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} />
        {t('paymentSource.title')}
      </button>

      {/* Header card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] truncate">{ps.name}</h1>
              <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[ps.status] ?? STATUS_CLASSES.archived}`}>
                {t(`paymentSource.status_${ps.status}`)}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-[hsl(var(--muted-foreground))]">{ps.code}</p>
          </div>

          {/* Primary actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCE_EDIT.replace(':id', id))}
            >
              <Pencil size={14} />
              {t('paymentSource.actions.edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/5"
              onClick={() => handleAction('delete')}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Metadata grid */}
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[hsl(var(--border))] pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.type')}</dt>
            <dd className="mt-1 text-sm font-medium text-[hsl(var(--foreground))]">{t(`paymentSource.type_${ps.type}`)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.currency')}</dt>
            <dd className="mt-1 text-sm font-medium text-[hsl(var(--foreground))]">{ps.currency}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.status')}</dt>
            <dd className="mt-1">
              <div className="flex flex-wrap gap-1.5">
                {ps.status === 'active' && (
                  <button
                    onClick={() => handleAction('deactivate')}
                    className="text-xs text-[hsl(var(--muted-foreground))] underline-offset-2 hover:underline"
                  >
                    {t('paymentSource.actions.deactivate')}
                  </button>
                )}
                {ps.status === 'inactive' && (
                  <button
                    onClick={() => handleAction('activate')}
                    className="text-xs text-[hsl(var(--primary))] underline-offset-2 hover:underline"
                  >
                    {t('paymentSource.actions.activate')}
                  </button>
                )}
                {ps.status !== 'archived' && (
                  <button
                    onClick={() => handleAction('archive')}
                    className="text-xs text-[hsl(var(--muted-foreground))] underline-offset-2 hover:underline"
                  >
                    {t('paymentSource.actions.archive')}
                  </button>
                )}
              </div>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.createdAt')}</dt>
            <dd className="mt-1 text-sm text-[hsl(var(--foreground))]">{ps.createdAt.slice(0, 10)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.updatedAt')}</dt>
            <dd className="mt-1 text-sm text-[hsl(var(--foreground))]">{ps.updatedAt.slice(0, 10)}</dd>
          </div>
        </dl>

        {ps.description && (
          <div className="mt-5 border-t border-[hsl(var(--border))] pt-5">
            <dt className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.description')}</dt>
            <dd className="mt-1 text-sm text-[hsl(var(--foreground))]">{ps.description}</dd>
          </div>
        )}
      </div>
    </div>
  );
}
