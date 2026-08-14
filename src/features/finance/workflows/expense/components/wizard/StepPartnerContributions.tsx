import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { WizardNavigation } from '@/features/finance/workflows/shared/components/WizardNavigation';
import { usePeople } from '@/features/finance/people/hooks/usePeople';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import type { CurrencyCode } from '@/shared/types/currency';
import type { WorkflowFormData, PartnerContribution } from '@/features/finance/workflows/shared/types/workflow.types';

interface StepPartnerContributionsProps {
  data: WorkflowFormData;
  isFirstStep: boolean;
  onNext: (patch: Partial<WorkflowFormData>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepPartnerContributions({
  data,
  isFirstStep,
  onNext,
  onBack,
  onCancel,
}: StepPartnerContributionsProps) {
  const { t } = useTranslation();
  const { data: people = [], isLoading } = usePeople({ status: 'Active' });
  const partners = people.filter((p) => p.type === 'Partner');

  const [contributions, setContributions] = useState<PartnerContribution[]>(
    data.partnerContributions ?? [],
  );

  const totalAmount = data.amount as number;
  const currency = data.currency as CurrencyCode;
  const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);

  function addContribution(personId: string, personName: string) {
    if (contributions.some((c) => c.personId === personId)) return;
    const equalShare = partners.length > 0 ? Math.round((totalAmount / partners.length) * 100) / 100 : 0;
    setContributions((prev) => [...prev, { personId, personName, amount: equalShare }]);
  }

  function removeContribution(personId: string) {
    setContributions((prev) => prev.filter((c) => c.personId !== personId));
  }

  function updateAmount(personId: string, value: string) {
    const num = parseFloat(value);
    setContributions((prev) =>
      prev.map((c) => (c.personId === personId ? { ...c, amount: isNaN(num) ? 0 : num } : c)),
    );
  }

  function splitEqually() {
    if (contributions.length === 0) return;
    const perPerson = Math.round((totalAmount / contributions.length) * 100) / 100;
    setContributions((prev) => prev.map((c) => ({ ...c, amount: perPerson })));
  }

  function handleNext() {
    onNext({ partnerContributions: contributions });
  }

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-4">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t('expense.partnerContributions.totalExpense')}
        </p>
        <p className="mt-0.5 text-xl font-bold text-[hsl(var(--foreground))]">
          {formatAmount(totalAmount, currency)}
        </p>
      </div>

      {/* Partner picker */}
      {isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('common.loading')}</p>
      ) : partners.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center">
          <Users size={24} className="text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('expense.partnerContributions.noPartners')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {t('expense.partnerContributions.selectPartners')}
            </Label>
            {contributions.length > 1 && (
              <button
                type="button"
                onClick={splitEqually}
                className="text-xs text-[hsl(var(--primary))] hover:underline"
              >
                {t('expense.partnerContributions.splitEqually')}
              </button>
            )}
          </div>

          {/* Partner buttons */}
          <div className="flex flex-wrap gap-2">
            {partners.map((p) => {
              const isSelected = contributions.some((c) => c.personId === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    isSelected ? removeContribution(p.id) : addContribution(p.id, p.name)
                  }
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]/50'
                  }`}
                >
                  {isSelected ? (
                    <Trash2 size={11} />
                  ) : (
                    <PlusCircle size={11} />
                  )}
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Contribution rows */}
          {contributions.length > 0 && (
            <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] p-3">
              {contributions.map((c) => (
                <div key={c.personId} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[hsl(var(--foreground))]">
                    {c.personName}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={c.amount}
                      onChange={(e) => updateAmount(c.personId, e.target.value)}
                      className="h-8 w-28 text-end font-mono text-sm"
                    />
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{currency}</span>
                    <button
                      type="button"
                      onClick={() => removeContribution(c.personId)}
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-2 flex items-center justify-between border-t border-[hsl(var(--border))] pt-2">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t('expense.partnerContributions.totalContributed')}
                </span>
                <span
                  className={`font-mono text-sm font-semibold ${
                    totalContributed > totalAmount
                      ? 'text-[hsl(var(--destructive))]'
                      : totalContributed === totalAmount
                        ? 'text-[hsl(var(--success))]'
                        : 'text-[hsl(var(--foreground))]'
                  }`}
                >
                  {formatAmount(totalContributed, currency)}
                </span>
              </div>
            </div>
          )}

          {contributions.length === 0 && (
            <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              {t('expense.partnerContributions.hint')}
            </p>
          )}
        </div>
      )}

      <WizardNavigation
        isFirstStep={isFirstStep}
        isLastDataStep={false}
        isSubmitting={false}
        submitLabelKey="expense.wizard.createExpense"
        onBack={onBack}
        onCancel={onCancel}
        onNext={handleNext}
      />
    </div>
  );
}
