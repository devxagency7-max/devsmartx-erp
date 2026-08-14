import { cn } from '@/shared/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-4', className)}>
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">{title}</h2>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
