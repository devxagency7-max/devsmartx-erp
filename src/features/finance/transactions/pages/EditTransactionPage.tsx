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
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';
import { transactionService } from '../services/transactionService';
import { personService } from '@/features/finance/people/services/personService';
import { TransactionForm } from '../components/TransactionForm';
import type { TransactionSchema } from '../validation/transaction.schema';
import type { PartnerContributionEntry } from '../types/transaction.types';
import type { UploadResult } from '@/shared/upload';
import { useQueryClient } from '@tanstack/react-query';
import { TRANSACTIONS_QUERY_KEY } from '../hooks/useTransactions';

export function EditTransactionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { transaction: tx, isLoading, isError, error: fetchError } = useTransaction(id ?? '');
  const { paymentSources } = usePaymentSources();
  const { data: categories = [] } = useCategories();
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

  async function handleSubmit(
    values: TransactionSchema,
    contributions: PartnerContributionEntry[],
    _attachments: UploadResult[],
    allPartners: { personId: string; personName: string }[],
  ) {
    if (!id) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const categoryName = categories.find((c) => c.id === values.categoryId)?.name;
      const totalPartners = allPartners.length || contributions.length;
      const equalShare = totalPartners > 0 ? Math.round((values.amount / totalPartners) * 100) / 100 : 0;
      const contribsWithShare = contributions.map((c) => ({ ...c, equalShare }));
      await transactionService.update(id, { ...values, categoryName, allPartners, partnerContributions: contribsWithShare });

      // Re-write ledger entries for this transaction if it has contributions
      if (contributions.length > 0 && values.type === TransactionType.Expense) {
        // Delete existing ledger entries for this transaction first
        await personService.deleteLedgerEntriesByTransactionId(id);

        const totalPartners = allPartners.length || contributions.length;
        const equalShare = Math.round((values.amount / totalPartners) * 100) / 100;
        const paidIds = new Set(contributions.map((c) => c.personId));
        const unpaidPartners = allPartners.filter((p) => !paidIds.has(p.personId));
        const totalUnpaidShare = unpaidPartners.length * equalShare;
        const fullPayers = contributions.filter((c) => c.amount >= equalShare - 0.01);
        const extraPerFullPayer = fullPayers.length > 0
          ? Math.round((totalUnpaidShare / fullPayers.length) * 100) / 100
          : 0;

        const entries = [
          ...contributions.map((c) => {
            const paidFull = c.amount >= equalShare - 0.01;
            const net = paidFull
              ? Math.round((c.amount - equalShare + extraPerFullPayer) * 100) / 100
              : Math.round((equalShare - c.amount) * 100) / 100;
            if (Math.abs(net) < 0.01) return Promise.resolve();
            return personService.addLedgerEntry({
              personId: c.personId,
              direction: paidFull ? 'COMPANY_OWES_PERSON' : 'PERSON_OWES_COMPANY',
              amount: Math.abs(net),
              currency: values.currency,
              reason: paidFull
                ? `مساهمة زائدة في مصروف: ${values.description}`
                : `نصيب في مصروف: ${values.description}`,
              categoryId: values.categoryId || null,
              transactionId: id,
              date: values.transactionDate,
              notes: `مصروف — دفع ${c.personName} ${c.amount}، نصيبه ${equalShare}`,
            });
          }),
          ...unpaidPartners.map((p) =>
            personService.addLedgerEntry({
              personId: p.personId,
              direction: 'PERSON_OWES_COMPANY',
              amount: equalShare,
              currency: values.currency,
              reason: `نصيب في مصروف: ${values.description}`,
              categoryId: values.categoryId || null,
              transactionId: id,
              date: values.transactionDate,
              notes: `مصروف — نصيب ${p.personName} ${equalShare} — لم يدفع شيئاً`,
            }),
          ),
        ];
        await Promise.all(entries);
        await queryClient.invalidateQueries({ queryKey: ['people'] });
      }

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
            defaultContributions={tx.partnerContributions ?? []}
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
