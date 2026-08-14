import { PlusCircle, Trash2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/input';
import { usePartners } from '@/features/finance/master-data/partners/hooks/usePartners';
import { formatAmount } from '../utils/formatAmount';
import type { CurrencyCode } from '../types/transaction.types';
import type { PartnerContributionEntry } from '../types/transaction.types';

interface Props {
  totalAmount: number;
  currency: string;
  contributions: PartnerContributionEntry[];
  onChange: (contributions: PartnerContributionEntry[]) => void;
}

export function PartnerContributionsSection({ totalAmount, currency, contributions, onChange }: Props) {
  const { t } = useTranslation();
  const { data: partners = [], isLoading } = usePartners({ status: 'active' });

  const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);

  function addContribution(personId: string, personName: string) {
    if (contributions.some((c) => c.personId === personId)) return;
    const equalShare =
      partners.length > 0 ? Math.round((totalAmount / partners.length) * 100) / 100 : 0;
    onChange([...contributions, { personId, personName, amount: equalShare }]);
  }

  function removeContribution(personId: string) {
    onChange(contributions.filter((c) => c.personId !== personId));
  }

  function updateAmount(personId: string, value: string) {
    const num = parseFloat(value);
    onChange(
      contributions.map((c) =>
        c.personId === personId ? { ...c, amount: isNaN(num) ? 0 : num } : c,
      ),
    );
  }

  function splitEqually() {
    if (contributions.length === 0) return;
    const perPerson = Math.round((totalAmount / contributions.length) * 100) / 100;
    onChange(contributions.map((c) => ({ ...c, amount: perPerson })));
  }

  return (
    <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[hsl(var(--primary))]" />
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            {t('expense.partnerContributions.selectPartners')}
          </span>
        </div>
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

      {/* Partner toggle buttons */}
      {isLoading ? (
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">…</p>
      ) : partners.length === 0 ? (
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          {t('expense.partnerContributions.noPartners')}
        </p>
      ) : (
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
                {isSelected ? <Trash2 size={11} /> : <PlusCircle size={11} />}
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Amount rows */}
      {contributions.length > 0 && (
        <div className="space-y-2">
          {contributions.map((c) => (
            <div key={c.personId} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-sm text-[hsl(var(--foreground))]">
                {c.personName}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={c.amount}
                onChange={(e) => updateAmount(c.personId, e.target.value)}
                className="h-8 w-28 text-end font-mono text-sm"
              />
              <span className="w-10 text-xs text-[hsl(var(--muted-foreground))]">{currency}</span>
              <button
                type="button"
                onClick={() => removeContribution(c.personId)}
                className="text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--destructive))]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-2">
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
              {formatAmount(totalContributed, currency as CurrencyCode)}
            </span>
          </div>
        </div>
      )}

      {partners.length > 0 && contributions.length === 0 && (
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          {t('expense.partnerContributions.hint')}
        </p>
      )}
    </div>
  );
}
