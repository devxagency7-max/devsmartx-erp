import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { WizardNavigation } from '@/features/finance/workflows/shared/components/WizardNavigation';
import { expensePaymentSourceStepSchema, type ExpensePaymentSourceStepInput } from '../../validation/expense.schema';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';

interface StepWalletProps {
  data: WorkflowFormData;
  isFirstStep: boolean;
  onNext: (patch: Partial<WorkflowFormData>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepWallet({ data, isFirstStep, onNext, onBack, onCancel }: StepWalletProps) {
  const { t } = useTranslation();
  const { paymentSources, isLoading } = usePaymentSources();

  const activeSources = paymentSources.filter((s) => s.status === 'active');

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<ExpensePaymentSourceStepInput>({
    resolver: zodResolver(expensePaymentSourceStepSchema),
    defaultValues: {
      paymentSourceId: data.paymentSourceId,
      paymentSourceName: data.paymentSourceName,
      currency: data.currency,
    },
  });

  const selectedId = watch('paymentSourceId');

  function onSubmit(values: ExpensePaymentSourceStepInput) {
    onNext({ paymentSourceId: values.paymentSourceId, paymentSourceName: values.paymentSourceName, currency: values.currency });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('expense.wizard.selectPaymentSource')}</Label>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activeSources.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setValue('paymentSourceId', s.id, { shouldValidate: true });
                  setValue('paymentSourceName', s.name, { shouldValidate: true });
                  setValue('currency', s.currency, { shouldValidate: true });
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-all',
                  selectedId === s.id
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50',
                )}
              >
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.code}</p>
                </div>
                <span className="rounded-md bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-mono font-semibold">
                  {s.currency}
                </span>
              </button>
            ))}
          </div>
        )}
        {errors.paymentSourceId && (
          <p className="text-xs text-[hsl(var(--destructive))]">
            {t(errors.paymentSourceId.message ?? 'expense.validation.paymentSourceRequired')}
          </p>
        )}
      </div>

      <WizardNavigation
        isFirstStep={isFirstStep}
        isLastDataStep={false}
        isSubmitting={false}
        submitLabelKey="expense.wizard.createExpense"
        onBack={onBack}
        onCancel={onCancel}
        onNext={() => handleSubmit(onSubmit)()}
      />
    </form>
  );
}
