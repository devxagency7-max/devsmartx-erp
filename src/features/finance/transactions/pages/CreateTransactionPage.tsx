import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/shared/components/ui/card';
import { PageHeader } from '@/shared/components/ui/page-header';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { useCreateTransaction } from '../hooks/useCreateTransaction';
import { TransactionForm } from '../components/TransactionForm';
import type { TransactionSchema } from '../validation/transaction.schema';
import type { PartnerContributionEntry } from '../types/transaction.types';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';

export function CreateTransactionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setItems } = useBreadcrumb();
  const { createTransaction, isLoading, error, clearError } = useCreateTransaction();
  const { paymentSources } = usePaymentSources();

  const presetType = (searchParams.get('type') as TransactionType) ?? TransactionType.Expense;

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('transaction.title'), path: ROUTE_PATHS.TRANSACTIONS },
      { label: t('transaction.newTransaction') },
    ]);
  }, [setItems, t]);

  async function handleSubmit(values: TransactionSchema, contributions: PartnerContributionEntry[]) {
    clearError();
    const record = await createTransaction({ ...values, partnerContributions: contributions });
    if (record) {
      toast.success(t('transaction.createTransaction'));
      navigate(`${ROUTE_PATHS.TRANSACTIONS}/${record.id}`);
    }
  }

  const paymentSourceOptions = paymentSources.map((s) => ({
    id: s.id,
    name: s.name,
    currency: s.currency,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={t('transaction.createTransaction')}
        description={t('transaction.moduleDescription')}
      />

      <Card>
        <CardContent className="pt-6">
          <TransactionForm
            defaultValues={{ type: presetType }}
            paymentSources={paymentSourceOptions}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            onCancel={() => navigate(ROUTE_PATHS.TRANSACTIONS)}
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  );
}
