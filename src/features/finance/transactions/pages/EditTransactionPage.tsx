import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ErrorState } from '@/shared/components/ui/error-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { useTransaction } from '../hooks/useTransaction';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { transactionService } from '../services/transactionService';
import { TransactionForm } from '../components/TransactionForm';
import type { TransactionSchema } from '../validation/transaction.schema';
import { useQueryClient } from '@tanstack/react-query';
import { TRANSACTIONS_QUERY_KEY } from '../hooks/useTransactions';

export function EditTransactionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { transaction: tx, isLoading, isError, error: fetchError } = useTransaction(id ?? '');
  const { paymentSources } = usePaymentSources();
  const { setItems } = useBreadcrumb();

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('transaction.title'), path: ROUTE_PATHS.TRANSACTIONS },
      { label: tx?.referenceNumber ?? '…', path: `${ROUTE_PATHS.TRANSACTIONS}/${id}` },
      { label: t('transaction.actions.edit') },
    ]);
  }, [setItems, t, tx?.referenceNumber, id]);

  async function handleSubmit(values: TransactionSchema, _contributions: unknown, _attachments: unknown) {
    void _contributions;
    void _attachments;
    if (!id) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await transactionService.update(id, values);
      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      toast.success(t('common.save'));
      navigate(`${ROUTE_PATHS.TRANSACTIONS}/${id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'transaction.errors.updateFailed');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) return <ErrorState error={fetchError as Error} />;
  if (!tx) return <ErrorState error={t('transaction.errors.notFound')} />;

  const isTerminal =
    tx.status === TransactionStatus.Completed ||
    tx.status === TransactionStatus.Cancelled ||
    tx.status === TransactionStatus.Rejected;

  const isReadOnly = isTerminal || tx.type === TransactionType.OpeningBalance;

  const paymentSourceOptions = paymentSources.map((s) => ({
    id: s.id,
    name: s.name,
    currency: s.currency,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={t('transaction.editTransaction')}
        description={tx.referenceNumber}
      />

      <Card>
        <CardContent className="pt-6">
          <TransactionForm
            defaultValues={{
              type: tx.type,
              paymentSourceId: tx.paymentSourceId,
              destinationPaymentSourceId: tx.destinationPaymentSourceId ?? '',
              partnerId: tx.partnerId ?? '',
              originalTransactionId: tx.originalTransactionId ?? '',
              amount: tx.amount,
              currency: tx.currency,
              paymentMethod: tx.paymentMethod as PaymentMethod,
              categoryId: tx.categoryId ?? '',
              description: tx.description,
              notes: tx.notes,
              transactionDate: tx.transactionDate,
            }}
            paymentSources={paymentSourceOptions}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            error={saveError}
            onCancel={() => navigate(`${ROUTE_PATHS.TRANSACTIONS}/${id}`)}
            readOnly={isReadOnly}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
