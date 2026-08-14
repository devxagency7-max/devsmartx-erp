import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { MasterDataStatus } from '../types';

interface Props { status: MasterDataStatus; className?: string }

export function StatusBadge({ status, className }: Props) {
  const { t } = useTranslation();
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
      status === 'active'
        ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20'
        : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
      className
    )}>
      {t(`masterData.status.${status}`)}
    </span>
  );
}
