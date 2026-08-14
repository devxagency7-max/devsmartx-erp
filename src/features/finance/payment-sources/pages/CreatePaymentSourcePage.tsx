import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useCreatePaymentSource } from '../hooks/usePaymentSources';
import { createPaymentSourceSchema, type CreatePaymentSourceFormValues } from '../validation/paymentSource.schema';
import { PaymentSourceType } from '../types/paymentSource.types';

const SELECT_CLASS = 'h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]';
const TEXTAREA_CLASS = 'w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] resize-none';

export default function CreatePaymentSourcePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const createMutation = useCreatePaymentSource();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('paymentSource.title'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('paymentSource.createPaymentSource') },
    ]);
  }, [setItems, t]);

  const form = useForm<CreatePaymentSourceFormValues>({
    resolver: zodResolver(createPaymentSourceSchema),
    defaultValues: {
      name: '',
      type: PaymentSourceType.BankAccount,
      currency: 'EGP',
      description: '',
    },
  });

  const onSubmit = async (values: CreatePaymentSourceFormValues) => {
    try {
      const result = await createMutation.mutateAsync(values);
      toast.success(t('paymentSource.createPaymentSource'));
      navigate(ROUTE_PATHS.PAYMENT_SOURCE_DETAILS.replace(':id', result.id));
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  const typeOptions = Object.values(PaymentSourceType);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCES)}
        className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft size={15} />
        {t('common.back')}
      </button>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          {t('paymentSource.createPaymentSource')}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {t('paymentSource.moduleDescription')}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">
              {t('paymentSource.name')} <span className="text-[hsl(var(--destructive))]">*</span>
            </label>
            <Input
              {...form.register('name')}
              placeholder={t('paymentSource.namePlaceholder')}
            />
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
              {form.formState.errors.type && (
                <p className="text-xs text-[hsl(var(--destructive))]">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                {t('paymentSource.currency')} <span className="text-[hsl(var(--destructive))]">*</span>
              </label>
              <select {...form.register('currency')} className={SELECT_CLASS}>
                {['EGP', 'USD', 'EUR', 'SAR', 'AED'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {form.formState.errors.currency && (
                <p className="text-xs text-[hsl(var(--destructive))]">{form.formState.errors.currency.message}</p>
              )}
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
            onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCES)}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
