import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';

/**
 * ErrorState — shown when a data fetch or action fails.
 *
 * @prop error   - Error object or string message
 * @prop onRetry - Optional retry callback; renders a Retry button when provided
 *
 * @example
 * <ErrorState error={error} onRetry={refetch} />
 *
 * @accessibility
 * Renders role="alert" so screen readers announce the error immediately.
 */

interface ErrorStateProps {
  error?: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const message =
    typeof error === 'string'
      ? error
      : (error?.message ?? 'Something went wrong. Please try again.');

  return (
    <section
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--destructive))]/10">
        <AlertTriangle size={24} className="text-[hsl(var(--destructive))]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
          An error occurred
        </p>
        <p className="max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </section>
  );
}
