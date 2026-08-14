import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { usePaymentMethods, useCreatePaymentMethod, usePaymentMethodActions } from '../hooks/usePaymentMethods';
import { paymentMethodSchema, paymentMethodDefaultValues, type PaymentMethodFormValues } from '../validation/payment-method.schema';
import { StatusBadge } from '../../shared/components/StatusBadge';

export default function PaymentMethodsPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
      { label: t('masterData.paymentMethods.title') },
    ]);
  }, [setItems, t]);

  const { data: methods = [], isLoading } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const { setStatus, remove } = usePaymentMethodActions();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: paymentMethodDefaultValues,
  });

  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(t('masterData.paymentMethods.createSuccess'));
      reset(paymentMethodDefaultValues);
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t('common.errors.unknown'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('masterData.paymentMethods.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('masterData.paymentMethods.description')}</p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('masterData.paymentMethods.addNew')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">{t('masterData.paymentMethods.addNew')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.fields.code')} *</label>
              <input {...register('code')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.code && <p className="mt-1 text-xs text-destructive">{t(errors.code.message!)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.fields.name')} *</label>
              <input {...register('name')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{t(errors.name.message!)}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.fields.description')}</label>
            <input {...register('description')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
              {t('common.actions.save')}
            </button>
            <button type="button" onClick={() => { reset(paymentMethodDefaultValues); setShowForm(false); }} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              {t('common.actions.cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.code')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.description')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{m.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.description || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setStatus.mutate({ id: m.id, status: m.status === 'active' ? 'inactive' : 'active' })}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={m.status === 'active' ? t('masterData.actions.deactivate') : t('masterData.actions.activate')}
                      >
                        {m.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      {!m.isSystem && (
                        <button
                          onClick={() => { if (window.confirm(t('common.confirmDelete'))) remove.mutate(m.id); }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
