import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { FinancialWorkflowStep, WorkflowStepId } from '../types/workflow.types';

interface WizardProgressProps {
  steps: ReadonlyArray<FinancialWorkflowStep>;
  currentStepId: WorkflowStepId;
}

export function WizardProgress({ steps, currentStepId }: WizardProgressProps) {
  const { t } = useTranslation();
  const currentIdx = steps.findIndex((s) => s.id === currentStepId);

  return (
    <nav aria-label="Wizard progress">
      <ol className="flex items-center gap-0">
        {steps.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    done && 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
                    active && 'border-[hsl(var(--primary))] bg-transparent text-[hsl(var(--primary))]',
                    !done && !active && 'border-[hsl(var(--border))] bg-transparent text-[hsl(var(--muted-foreground))]',
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                </div>
                <span
                  className={cn(
                    'hidden sm:block text-[10px] font-medium whitespace-nowrap',
                    active ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]',
                  )}
                >
                  {t(step.labelKey)}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'h-[2px] flex-1 mx-1 rounded transition-colors',
                    done ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
