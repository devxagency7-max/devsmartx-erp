import { cn } from '@/shared/lib/utils';

/**
 * Spinner — inline loading indicator.
 *
 * @prop size - "sm" | "md" | "lg" (default "md")
 * @prop label - accessible screen-reader label (default "Loading...")
 *
 * @example
 * <Spinner size="sm" />
 * <Spinner label="Saving changes..." />
 *
 * @accessibility
 * Renders role="status" with an aria-label for screen readers.
 */

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeMap;
  label?: string;
  className?: string;
}

export function Spinner({ size = 'md', label = 'Loading...', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        sizeMap[size],
        className,
      )}
    />
  );
}
