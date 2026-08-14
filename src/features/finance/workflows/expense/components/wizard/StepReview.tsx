import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/badge';
import { ReviewCard } from '@/features/finance/workflows/shared/components/ReviewCard';
import { WizardNavigation } from '@/features/finance/workflows/shared/components/WizardNavigation';
import { useCreateExpense } from '../../hooks/useCreateExpense';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import type { CurrencyCode } from '@/shared/types/currency';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';
import toast from 'react-hot-toast';

interface StepReviewProps {
  data: WorkflowFormData;
  isFirstStep: boolean;
  onSuccess: (id: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepReview({ data, isFirstStep, onSuccess, onBack, onCancel }: StepReviewProps) {
  const { t } = useTranslation();
  const { mutate, isPending } = useCreateExpense();

  function handleSubmit() {
    mutate(data, {
      onSuccess: (tx) => {
        toast.success(t('expense.createSuccess'));
        onSuccess(tx.id);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t('common.errors.unknown'));
      },
    });
  }

  const vendor = (data.extra.vendor as string) || '';
  const contributions = data.partnerContributions ?? [];

  const reviewRows = [
    { label: t('transaction.category'), value: data.categoryName },
    { label: t('transaction.paymentSource'), value: data.paymentSourceName },
    { label: t('transaction.paymentMethod'), value: t(`transaction.pm_${data.paymentMethod}`) },
    { label: t('transaction.amount'), value: formatAmount(data.amount as number, data.currency as CurrencyCode) },
    { label: t('transaction.transactionDate'), value: data.transactionDate },
    ...(vendor ? [{ label: t('expense.fields.vendor'), value: vendor }] : []),
    { label: t('transaction.description'), value: data.description },
    ...(data.notes ? [{ label: t('transaction.notes'), value: data.notes }] : []),
    ...(contributions.length > 0
      ? contributions.map((c) => ({
          label: c.personName,
          value: formatAmount(c.amount, data.currency as CurrencyCode),
        }))
      : []),
  ];

  return (
    <div className="space-y-4">
      <ReviewCard title={t('transaction.summary')} rows={reviewRows} />

      {data.attachments.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {data.attachments.length} {t('transaction.attachments')}
          </Badge>
        </div>
      )}

      <WizardNavigation
        isFirstStep={isFirstStep}
        isLastDataStep={true}
        isSubmitting={isPending}
        submitLabelKey="expense.wizard.createExpense"
        onBack={onBack}
        onCancel={onCancel}
        onNext={handleSubmit}
      />
    </div>
  );
}
