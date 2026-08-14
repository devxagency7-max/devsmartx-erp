import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { WizardNavigation } from '@/features/finance/workflows/shared/components/WizardNavigation';
import { revenueDetailsStepSchema, type RevenueDetailsStepInput } from '../../validation/revenue.schema';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';

interface StepDetailsProps {
  data: WorkflowFormData;
  isFirstStep: boolean;
  onNext: (patch: Partial<WorkflowFormData>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepDetails({ data, isFirstStep, onNext, onBack, onCancel }: StepDetailsProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RevenueDetailsStepInput>({
    resolver: zodResolver(revenueDetailsStepSchema),
    defaultValues: {
      amount: data.amount === '' ? undefined : (data.amount as number),
      transactionDate: data.transactionDate,
      source: (data.extra.source as string) ?? '',
      relatedProject: (data.extra.relatedProject as string) ?? '',
      description: data.description,
      notes: data.notes,
    },
  });

  function onSubmit(values: RevenueDetailsStepInput) {
    onNext({
      amount: values.amount,
      transactionDate: values.transactionDate,
      description: values.description,
      notes: values.notes ?? '',
      extra: {
        ...data.extra,
        source: values.source ?? '',
        relatedProject: values.relatedProject ?? '',
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">{t('transaction.amount')} *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-xs text-[hsl(var(--destructive))]">
              {t(errors.amount.message ?? 'revenue.validation.amountPositive')}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t('transaction.currency')}</Label>
          <Input value={data.currency} readOnly className="bg-[hsl(var(--muted))] font-mono text-sm" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="transactionDate">{t('transaction.transactionDate')} *</Label>
        <Input id="transactionDate" type="date" {...register('transactionDate')} />
        {errors.transactionDate && (
          <p className="text-xs text-[hsl(var(--destructive))]">
            {t(errors.transactionDate.message ?? 'revenue.validation.dateRequired')}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source">{t('revenue.fields.source')}</Label>
        <Input
          id="source"
          placeholder={t('revenue.fields.sourcePlaceholder')}
          {...register('source')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="relatedProject">{t('revenue.fields.relatedProject')}</Label>
        <Input
          id="relatedProject"
          placeholder={t('revenue.fields.relatedProjectPlaceholder')}
          {...register('relatedProject')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t('transaction.description')} *</Label>
        <Input
          id="description"
          placeholder={t('transaction.descriptionPlaceholder')}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-[hsl(var(--destructive))]">
            {t(errors.description.message ?? 'revenue.validation.descriptionRequired')}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">{t('transaction.notes')}</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder={t('transaction.notesPlaceholder')}
          {...register('notes')}
        />
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
