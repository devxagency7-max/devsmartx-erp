import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface SummaryCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}

export function SummaryCard({ icon, label, value, className }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
        <span className="text-sm font-semibold truncate">{value}</span>
      </div>
    </div>
  );
}
