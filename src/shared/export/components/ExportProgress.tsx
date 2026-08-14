import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';
import type { ExportProgressState } from '../types/export.types';

interface ExportProgressProps {
  progress: ExportProgressState;
  className?: string;
}

export function ExportProgress({ progress, className }: ExportProgressProps) {
  if (progress.stage === 'idle') return null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {progress.message && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{progress.message}</p>
      )}
      <Progress value={progress.percent} className="h-1.5" />
    </div>
  );
}
