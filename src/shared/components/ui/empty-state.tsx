import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

/**
 * EmptyState — shown when a list or resource has no data.
 *
 * @prop icon      - Lucide icon component (default InboxIcon)
 * @prop title     - Primary message
 * @prop description - Supporting text
 * @prop action    - Optional CTA element (e.g. a Button)
 *
 * @example
 * <EmptyState
 *   title="No invoices yet"
 *   description="Create your first invoice to get started."
 *   action={<Button>Create Invoice</Button>}
 * />
 *
 * @accessibility
 * Wraps content in <section> with aria-label matching the title.
 */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
        <Icon size={24} className="text-[hsl(var(--muted-foreground))]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</p>
        {description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </section>
  );
}
