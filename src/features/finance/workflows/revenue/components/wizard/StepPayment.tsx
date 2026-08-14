import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { WizardNavigation } from '@/features/finance/workflows/shared/components/WizardNavigation';
import { revenuePaymentStepSchema, type RevenuePaymentStepInput } from '../../validation/revenue.schema';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';

const PAYMENT_METHODS = Object.values(PaymentMethod);

interface StepPaymentProps {
  data: WorkflowFormData;
  isFirstStep: boolean;
  onNext: (patch: Partial<WorkflowFormData>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepPayment({ data, isFirstStep, onNext, onBack, onCancel }: StepPaymentProps) {
  const { t } = useTranslation();

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<RevenuePaymentStepInput>({
    resolver: zodResolver(revenuePaymentStepSchema),
    defaultValues: { paymentMethod: data.paymentMethod },
  });

  const selected = watch('paymentMethod');

  function onSubmit(values: RevenuePaymentStepInput) {
    onNext({ paymentMethod: values.paymentMethod });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('revenue.wizard.selectPaymentMethod')}</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm}
              type="button"
              onClick={() => setValue('paymentMethod', pm, { shouldValidate: true })}
              className={cn(
                'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all',
                selected === pm
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50',
              )}
            >
              {t(`transaction.pm_${pm}`)}
            </button>
          ))}
        </div>
        {errors.paymentMethod && (
          <p className="text-xs text-[hsl(var(--destructive))]">
            {t(errors.paymentMethod.message ?? 'revenue.validation.paymentMethodRequired')}
          </p>
        )}
      </div>

      <WizardNavigation
        isFirstStep={isFirstStep}
        isLastDataStep={false}
        isSubmitting={false}
        submitLabelKey="revenue.wizard.createRevenue"
        onBack={onBack}
        onCancel={onCancel}
        onNext={() => handleSubmit(onSubmit)()}
      />
    </form>
  );
}
