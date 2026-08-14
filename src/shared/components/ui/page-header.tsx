import { cn } from '@/shared/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-6', className)}>
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))] truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
