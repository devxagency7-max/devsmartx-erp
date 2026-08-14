import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import type { FinancialWorkflowDefinition } from '../types/workflow.types';

interface WorkflowCompleteScreenProps {
  definition: FinancialWorkflowDefinition;
  transactionId: string;
  onCreateAnother: () => void;
}

export function WorkflowCompleteScreen({
  definition,
  transactionId,
  onCreateAnother,
}: WorkflowCompleteScreenProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const detailsPath = definition.detailsRoute.replace(':id', transactionId);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
        <CheckCircle2 className="h-8 w-8 text-[hsl(var(--primary))]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-semibold">{t(definition.successTitleKey)}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t(definition.successDescriptionKey)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onCreateAnother}>
          {t('expense.wizard.createAnother')}
        </Button>
        <Button onClick={() => navigate(detailsPath)}>
          {t('expense.wizard.viewExpense')}
        </Button>
      </div>
    </div>
  );
}
