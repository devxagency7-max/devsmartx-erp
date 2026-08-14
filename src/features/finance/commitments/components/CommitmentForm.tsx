import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';
import { Button } from '@/shared/components/ui/button';
import type { CreateCommitmentFormValues } from '../validation/commitment.schema';

interface CommitmentFormProps {
  form: UseFormReturn<CreateCommitmentFormValues>;
  onSubmit: (values: CreateCommitmentFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CommitmentForm({ form, onSubmit, isSubmitting, onCancel }: CommitmentFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = form;
  const { paymentSources } = usePaymentSources();
  const { data: categories = [] } = useCategories();

  const currencies = ['EGP', 'USD', 'EUR', 'SAR', 'AED'];
  const frequencies = ['Weekly', 'Monthly', 'Quarterly', 'SemiAnnual', 'Yearly', 'Custom'] as const;
  const paymentMethods = [
    { value: 'Cash', label: t('transaction.pm_Cash') },
    { value: 'BankTransfer', label: t('transaction.pm_BankTransfer') },
    { value: 'Card', label: t('transaction.pm_Card') },
    { value: 'Instapay', label: t('transaction.pm_Instapay') },
    { value: 'VodafoneCash', label: t('transaction.pm_VodafoneCash') },
    { value: 'Cheque', label: t('transaction.pm_Cheque') },
    { value: 'Other', label: t('transaction.pm_Other') },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.name')} <span className="text-destructive">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('commitment.namePlaceholder')}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.vendor')}
            </label>
            <input
              {...register('vendorName')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('commitment.vendorPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('export.columns.amount')} <span className="text-destructive">*</span>
            </label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('export.columns.currency')} <span className="text-destructive">*</span>
            </label>
            <select
              {...register('currency')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.frequency')} <span className="text-destructive">*</span>
            </label>
            <select
              {...register('frequency')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {frequencies.map((f) => (
                <option key={f} value={f}>{t(`commitment.frequency_${f}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.startDate')} <span className="text-destructive">*</span>
            </label>
            <input
              {...register('startDate')}
              type="date"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.endDate')}
            </label>
            <input
              {...register('endDate')}
              type="date"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('export.columns.category')}
            </label>
            <select
              {...register('categoryId')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('commitment.noCategory')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.defaultPaymentSource')}
            </label>
            <select
              {...register('defaultPaymentSourceId')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('commitment.noPaymentSource')}</option>
              {paymentSources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.defaultPaymentMethod')}
            </label>
            <select
              {...register('defaultPaymentMethodId')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('commitment.noPaymentMethod')}</option>
              {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.description')}
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('commitment.notes')}
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
