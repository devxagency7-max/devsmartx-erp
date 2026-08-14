import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { FinancialWorkflowDefinition } from '../types/workflow.types';

interface FinancialWizardHeaderProps {
  definition: FinancialWorkflowDefinition;
  onCancel: () => void;
}

export function FinancialWizardHeader({
  definition,
  onCancel,
}: FinancialWizardHeaderProps) {
  const { t } = useTranslation();
  const Icon = definition.icon;

  return (
    <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${definition.color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: definition.color }} />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-none">{t(definition.titleKey)}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {t(definition.descriptionKey)}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onCancel}
        aria-label={t('common.close')}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
