import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { WizardNavigation } from '@/features/finance/workflows/shared/components/WizardNavigation';
import { expenseCategoryStepSchema, type ExpenseCategoryStepInput } from '../../validation/expense.schema';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';

interface StepCategoryProps {
  data: WorkflowFormData;
  isFirstStep: boolean;
  onNext: (patch: Partial<WorkflowFormData>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepCategory({ data, isFirstStep, onNext, onBack, onCancel }: StepCategoryProps) {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories();

  const expenseCategories = categories.filter(
    (c) => c.applicableTypes.includes(TransactionType.Expense) && c.status === 'active',
  );

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<ExpenseCategoryStepInput>({
    resolver: zodResolver(expenseCategoryStepSchema),
    defaultValues: {
      categoryId: data.categoryId,
      categoryName: data.categoryName,
    },
  });

  const selectedId = watch('categoryId');

  function onSubmit(values: ExpenseCategoryStepInput) {
    onNext({ categoryId: values.categoryId, categoryName: values.categoryName });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('expense.wizard.selectCategory')}</Label>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {expenseCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setValue('categoryId', cat.id, { shouldValidate: true });
                  setValue('categoryName', cat.name, { shouldValidate: true });
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all',
                  selectedId === cat.id
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50',
                )}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                  style={{ backgroundColor: cat.color + '20', color: cat.color }}
                >
                  {cat.icon ? cat.icon.slice(0, 2) : '📂'}
                </span>
                <span className="text-xs font-medium leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
        {errors.categoryId && (
          <p className="text-xs text-[hsl(var(--destructive))]">
            {t(errors.categoryId.message ?? 'expense.validation.categoryRequired')}
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
