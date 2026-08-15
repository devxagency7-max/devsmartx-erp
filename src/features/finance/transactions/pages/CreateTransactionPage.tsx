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
import type { UploadResult } from '@/shared/upload';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';

export function CreateTransactionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setItems } = useBreadcrumb();
  const { createTransaction, isLoading, error, clearError } = useCreateTransaction();
  const { paymentSources } = usePaymentSources();
  const { data: categories = [] } = useCategories();

  const presetType = (searchParams.get('type') as TransactionType) ?? TransactionType.Expense;

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('transaction.title'), path: ROUTE_PATHS.TRANSACTIONS },
      { label: t('transaction.newTransaction') },
    ]);
  }, [setItems, t]);

  async function handleSubmit(values: TransactionSchema, contributions: PartnerContributionEntry[], attachments: UploadResult[], allPartners: { personId: string; personName: string }[]) {
    clearError();
    const categoryName = categories.find((c) => c.id === values.categoryId)?.name;
    const record = await createTransaction({ ...values, categoryName, partnerContributions: contributions, allPartners, attachments });
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
