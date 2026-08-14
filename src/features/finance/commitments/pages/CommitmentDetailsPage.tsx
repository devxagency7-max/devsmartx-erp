import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, ArrowLeft, CheckCircle2, Pause, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { Button } from '@/shared/components/ui/button';
import { useCommitment, useCommitmentPayments, useMarkCommitmentPaid, useCommitmentActions } from '../hooks/useCommitments';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';
import { getDueWindow } from '../utils/commitmentHelpers';
import { recordPaymentSchema, type RecordPaymentFormValues } from '../validation/commitment.schema';

export default function CommitmentDetailsPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: commitment, isLoading } = useCommitment(id);
  const { data: payments = [] } = useCommitmentPayments(id);
  const markPaid = useMarkCommitmentPaid();
  const { setStatus } = useCommitmentActions();
  const { paymentSources } = usePaymentSources();
  const { data: categories = [] } = useCategories();
  const [showPayForm, setShowPayForm] = useState(false);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('commitment.title'), path: ROUTE_PATHS.COMMITMENTS },
      { label: commitment?.name ?? '…' },
    ]);
  }, [setItems, t, commitment]);

  const payForm = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      commitmentId: id,
      paymentSourceId: commitment?.defaultPaymentSourceId ?? '',
      amount: commitment?.amount ?? 0,
      currency: commitment?.currency ?? 'EGP',
      paymentMethodId: commitment?.defaultPaymentMethodId ?? '',
      categoryId: commitment?.categoryId ?? '',
      paidAt: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  useEffect(() => {
    if (commitment) {
      payForm.reset({
        commitmentId: id,
        paymentSourceId: commitment.defaultPaymentSourceId ?? '',
        amount: commitment.amount,
        currency: commitment.currency,
        paymentMethodId: commitment.defaultPaymentMethodId ?? '',
        categoryId: commitment.categoryId ?? '',
        paidAt: new Date().toISOString().slice(0, 10),
        notes: '',
      });
    }
  }, [commitment, id, payForm]);

  const onMarkPaid = async (values: RecordPaymentFormValues) => {
    try {
      const result = await markPaid.mutateAsync(values);
      const expectedAmount = commitment?.amount ?? 0;
      if (result.payment.amount < expectedAmount) {
        toast(`${t('commitment.paidPartial')} (${result.payment.amount} / ${expectedAmount} ${commitment?.currency})`, { icon: '⚠️', duration: 5000 });
      } else if (result.payment.amount > expectedAmount) {
        toast(`${t('commitment.paidOverpaid')} (${result.payment.amount} vs ${expectedAmount} ${commitment?.currency})`, { icon: '⚠️', duration: 5000 });
      } else {
        toast.success(t('commitment.markPaidSuccess'));
      }
      setShowPayForm(false);
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  const paymentMethods = [
    { value: 'Cash', label: t('transaction.pm_Cash') },
    { value: 'BankTransfer', label: t('transaction.pm_BankTransfer') },
    { value: 'Card', label: t('transaction.pm_Card') },
    { value: 'Instapay', label: t('transaction.pm_Instapay') },
    { value: 'VodafoneCash', label: t('transaction.pm_VodafoneCash') },
    { value: 'Cheque', label: t('transaction.pm_Cheque') },
    { value: 'Other', label: t('transaction.pm_Other') },
  ];

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!commitment) {
    return <div className="text-center py-16 text-muted-foreground">{t('commitment.notFound')}</div>;
  }

  const dueWindow = getDueWindow(commitment.nextDueDate, commitment.status);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(ROUTE_PATHS.COMMITMENTS)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          {commitment.status === 'Active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPayForm(!showPayForm)}
              >
                <CheckCircle2 className="h-4 w-4 me-1" />
                {t('commitment.markPaid')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus.mutate({ id, status: 'Paused' });
                  toast.success(t('commitment.pauseSuccess'));
                }}
              >
                <Pause className="h-4 w-4 me-1" />
                {t('commitment.pause')}
              </Button>
            </>
          )}
          {commitment.status === 'Paused' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus.mutate({ id, status: 'Active' });
                toast.success(t('commitment.resumeSuccess'));
              }}
            >
              {t('commitment.resume')}
            </Button>
          )}
          {(commitment.status === 'Active' || commitment.status === 'Paused') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm(t('commitment.confirmCancel'))) {
                  setStatus.mutate({ id, status: 'Cancelled' });
                  toast.success(t('commitment.cancelSuccess'));
                }
              }}
            >
              <XCircle className="h-4 w-4 me-1" />
              {t('common.cancel')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => navigate(ROUTE_PATHS.COMMITMENT_EDIT.replace(':id', id))}
          >
            <Pencil className="h-4 w-4 me-1" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{commitment.name}</h1>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{commitment.code}</p>
          </div>
          <div className="text-end">
            <div className="text-2xl font-bold tabular-nums">
              {commitment.amount.toLocaleString()} {commitment.currency}
            </div>
            <div className="text-xs text-muted-foreground">{t(`commitment.frequency_${commitment.frequency}`)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('export.columns.status')}: </span>
            <span className="font-medium">{t(`commitment.status_${commitment.status}`)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('commitment.dueWindow')}: </span>
            <span className="font-medium">{t(`commitment.dueWindow_${dueWindow}`)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('commitment.nextDueDate')}: </span>
            <span className="font-medium">{commitment.nextDueDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('commitment.startDate')}: </span>
            <span className="font-medium">{commitment.startDate}</span>
          </div>
          {commitment.endDate && (
            <div>
              <span className="text-muted-foreground">{t('commitment.endDate')}: </span>
              <span className="font-medium">{commitment.endDate}</span>
            </div>
          )}
          {commitment.vendorName && (
            <div>
              <span className="text-muted-foreground">{t('commitment.vendor')}: </span>
              <span className="font-medium">{commitment.vendorName}</span>
            </div>
          )}
          {commitment.categoryName && (
            <div>
              <span className="text-muted-foreground">{t('export.columns.category')}: </span>
              <span className="font-medium">{commitment.categoryName}</span>
            </div>
          )}
          {commitment.defaultPaymentSourceName && (
            <div>
              <span className="text-muted-foreground">{t('commitment.defaultPaymentSource')}: </span>
              <span className="font-medium">{commitment.defaultPaymentSourceName}</span>
            </div>
          )}
        </div>

        {commitment.description && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{commitment.description}</p>
          </div>
        )}
        {commitment.notes && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground italic">{commitment.notes}</p>
          </div>
        )}
      </div>

      {showPayForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('commitment.recordPayment')}</h2>
          <form onSubmit={payForm.handleSubmit(onMarkPaid)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.amount')} *</label>
              <input
                {...payForm.register('amount', { valueAsNumber: true })}
                type="number" min="0" step="0.01"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.currency')} *</label>
              <select {...payForm.register('currency')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {['EGP', 'USD', 'EUR', 'SAR', 'AED'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.defaultPaymentSource')} *</label>
              <select {...payForm.register('paymentSourceId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('commitment.noPaymentSource')}</option>
                {paymentSources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.defaultPaymentMethod')} *</label>
              <select {...payForm.register('paymentMethodId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('commitment.noPaymentMethod')}</option>
                {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.category')} *</label>
              <select {...payForm.register('categoryId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('commitment.noCategory')}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.paidAt')} *</label>
              <input {...payForm.register('paidAt')} type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.notes')}</label>
              <input {...payForm.register('notes')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowPayForm(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={markPaid.isPending}>
                {markPaid.isPending ? t('common.loading') : t('commitment.markPaid')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {payments.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">{t('commitment.paymentHistory')}</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.paidAt')}</th>
                <th className="px-4 py-3 text-end font-medium text-muted-foreground">{t('export.columns.amount')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.status')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.notes')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{p.paidAt}</td>
                  <td className="px-4 py-3 text-end font-semibold tabular-nums">
                    {p.amount.toLocaleString()} {p.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      p.status === 'Paid'
                        ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20'
                        : p.status === 'Partial'
                        ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20'
                        : 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20'
                    }`}>
                      {t(`commitment.paymentStatus_${p.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
