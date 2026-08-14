import { useTranslation } from 'react-i18next';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Users,
  RotateCcw,
  SlidersHorizontal,
  Landmark,
} from 'lucide-react';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { cn } from '@/shared/lib/utils';

const TYPE_CONFIG: Record<TransactionType, { icon: React.ElementType; color: string }> = {
  [TransactionType.Expense]:             { icon: ArrowDownCircle,    color: 'text-red-500' },
  [TransactionType.Revenue]:             { icon: ArrowUpCircle,      color: 'text-emerald-500' },
  [TransactionType.Transfer]:            { icon: ArrowLeftRight,     color: 'text-blue-500' },
  [TransactionType.PartnerContribution]: { icon: Users,              color: 'text-violet-500' },
  [TransactionType.Refund]:              { icon: RotateCcw,          color: 'text-amber-500' },
  [TransactionType.Adjustment]:          { icon: SlidersHorizontal,  color: 'text-slate-500' },
  [TransactionType.OpeningBalance]:      { icon: Landmark,           color: 'text-indigo-500' },
};

interface TransactionTypeBadgeProps {
  type: TransactionType;
  showLabel?: boolean;
  className?: string;
}

export function TransactionTypeBadge({
  type,
  showLabel = true,
  className,
}: TransactionTypeBadgeProps) {
  const { t } = useTranslation();
  const { icon: Icon, color } = TYPE_CONFIG[type] ?? TYPE_CONFIG[TransactionType.Expense];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon size={14} className={cn('shrink-0', color)} />
      {showLabel && (
        <span className="text-sm">{t(`transaction.type_${type}`)}</span>
      )}
    </span>
  );
}
