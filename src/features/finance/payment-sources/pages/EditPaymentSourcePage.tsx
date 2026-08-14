import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { usePaymentSource, useEditPaymentSource } from '../hooks/usePaymentSources';
import { editPaymentSourceSchema, type EditPaymentSourceFormValues } from '../validation/paymentSource.schema';
import { PaymentSourceType } from '../types/paymentSource.types';

const SELECT_CLASS = 'h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]';
const TEXTAREA_CLASS = 'w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] resize-none';

export default function EditPaymentSourcePage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: ps, isLoading } = usePaymentSource(id);
  const editMutation = useEditPaymentSource();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('paymentSource.title'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: ps?.name ?? '…', path: ROUTE_PATHS.PAYMENT_SOURCE_DETAILS.replace(':id', id) },
      { label: t('paymentSource.editPaymentSource') },
    ]);
  }, [setItems, t, ps, id]);

  const form = useForm<EditPaymentSourceFormValues>({
    resolver: zodResolver(editPaymentSourceSchema),
    defaultValues: { name: '', type: PaymentSourceType.BankAccount, description: '' },
  });

  useEffect(() => {
    if (ps) form.reset({ name: ps.name, type: ps.type, description: ps.description });
  }, [ps, form]);

  const onSubmit = async (values: EditPaymentSourceFormValues) => {
    try {
      await editMutation.mutateAsync({ id, input: values });
      toast.success(t('common.save'));
      navigate(ROUTE_PATHS.PAYMENT_SOURCE_DETAILS.replace(':id', id));
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />
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

  const typeOptions = Object.values(PaymentSourceType);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCE_DETAILS.replace(':id', id))}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} />
        {t('common.back')}
      </button>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          {t('paymentSource.editPaymentSource')}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{ps.name}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">
              {t('paymentSource.name')} <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-[hsl(var(--destructive))]">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Type + Currency row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                {t('paymentSource.type')} <span className="text-[hsl(var(--destructive))]">*</span>
              </label>
              <select {...form.register('type')} className={SELECT_CLASS}>
                {typeOptions.map((tp) => (
                  <option key={tp} value={tp}>{t(`paymentSource.type_${tp}`)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {t('paymentSource.currency')}
              </label>
              <Input value={ps.currency} disabled className="cursor-not-allowed opacity-60" />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {t('paymentSource.currencyLocked')}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">
              {t('paymentSource.description')}
            </label>
            <textarea
              {...form.register('description')}
              rows={3}
              className={TEXTAREA_CLASS}
              placeholder={t('paymentSource.descriptionPlaceholder')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCE_DETAILS.replace(':id', id))}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={editMutation.isPending}>
            {editMutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
