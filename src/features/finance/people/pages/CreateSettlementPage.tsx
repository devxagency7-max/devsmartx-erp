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
import { usePerson, usePersonBalances, useCreateSettlement } from '../hooks/usePeople';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';
import { createSettlementSchema, type CreateSettlementFormValues } from '../validation/person.schema';

export default function CreateSettlementPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: person } = usePerson(id);
  const { data: balances = [] } = usePersonBalances(id);
  const { paymentSources } = usePaymentSources();
  const { data: categories = [] } = useCategories();
  const createSettlement = useCreateSettlement();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('person.title'), path: ROUTE_PATHS.PEOPLE },
      { label: person?.name ?? '…', path: ROUTE_PATHS.PERSON_DETAILS.replace(':id', id) },
      { label: t('person.settle') },
    ]);
  }, [setItems, t, person, id]);

  const form = useForm<CreateSettlementFormValues>({
    resolver: zodResolver(createSettlementSchema),
    defaultValues: {
      personId: id,
      settlementDirection: 'PERSON_OWES_COMPANY',
      paymentSourceId: '',
      amount: 0,
      currency: 'EGP',
      paymentMethodId: '',
      categoryId: '',
      settledAt: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const paymentMethods = [
    { value: 'Cash', label: t('transaction.pm_Cash') },
    { value: 'BankTransfer', label: t('transaction.pm_BankTransfer') },
    { value: 'Card', label: t('transaction.pm_Card') },
    { value: 'Instapay', label: t('transaction.pm_Instapay') },
    { value: 'VodafoneCash', label: t('transaction.pm_VodafoneCash') },
    { value: 'Cheque', label: t('transaction.pm_Cheque') },
    { value: 'Other', label: t('transaction.pm_Other') },
  ];

  const onSubmit = async (values: CreateSettlementFormValues) => {
    try {
      const result = await createSettlement.mutateAsync({ ...values, amount: Number(values.amount) });
      toast.success(`${t('person.settleSuccess')} — ${result.transaction.referenceNumber}`);
      navigate(ROUTE_PATHS.PERSON_LEDGER.replace(':id', id));
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTE_PATHS.PERSON_DETAILS.replace(':id', id))}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('person.settle')}: {person?.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('person.settleDescription')}</p>
      </div>

      {balances.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">{t('person.currentBalance')}</h2>
          {balances.map((b) => (
            <div key={b.currency} className="text-sm flex justify-between">
              <span className={b.direction === 'PERSON_OWES_COMPANY' ? 'text-orange-600' : 'text-blue-600'}>
                {b.direction === 'PERSON_OWES_COMPANY'
                  ? t('person.personOwesCompany')
                  : b.direction === 'COMPANY_OWES_PERSON'
                  ? t('person.companyOwesPerson')
                  : t('person.settled')}
                {' '}({b.currency})
              </span>
              <span className="font-bold">{b.netAmount.toLocaleString()} {b.currency}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">{t('person.settlementDirection')} *</label>
              <select {...form.register('settlementDirection')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="PERSON_OWES_COMPANY">{t('person.settlePersonPaysCompany')}</option>
                <option value="COMPANY_OWES_PERSON">{t('person.settleCompanyPaysPerson')}</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">{t('person.settlementDirectionHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.amount')} *</label>
              <input {...form.register('amount', { valueAsNumber: true })} type="number" min="0" step="0.01" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {form.formState.errors.amount && <p className="mt-1 text-xs text-destructive">{form.formState.errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.currency')} *</label>
              <select {...form.register('currency')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {['EGP', 'USD', 'EUR', 'SAR', 'AED'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.defaultPaymentSource')} *</label>
              <select {...form.register('paymentSourceId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('commitment.noPaymentSource')}</option>
                {paymentSources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {form.formState.errors.paymentSourceId && <p className="mt-1 text-xs text-destructive">{form.formState.errors.paymentSourceId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.defaultPaymentMethod')} *</label>
              <select {...form.register('paymentMethodId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('commitment.noPaymentMethod')}</option>
                {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.category')} *</label>
              <select {...form.register('categoryId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('commitment.noCategory')}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.paidAt')} *</label>
              <input {...form.register('settledAt')} type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">{t('person.notes')}</label>
              <textarea {...form.register('notes')} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-200">
          {t('person.settlementWarning')}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTE_PATHS.PERSON_DETAILS.replace(':id', id))}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={createSettlement.isPending}>
            {createSettlement.isPending ? t('common.loading') : t('person.settle')}
          </Button>
        </div>
      </form>
    </div>
  );
}
