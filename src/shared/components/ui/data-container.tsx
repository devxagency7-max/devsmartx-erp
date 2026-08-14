import { cn } from '@/shared/lib/utils';
import { Spinner } from './spinner';
import { ErrorState } from './error-state';
import { EmptyState } from './empty-state';

interface DataContainerProps {
  isLoading?: boolean;
  error?: Error | string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DataContainer({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyTitle = 'No data',
  emptyDescription,
  emptyAction,
  children,
  className,
}: DataContainerProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} className={className} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  return <div className={className}>{children}</div>;
}
