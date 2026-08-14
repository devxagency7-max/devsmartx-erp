import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  className?: string;
}

export function UploadProgress({ progress, fileName, className }: UploadProgressProps) {
  return (
    <div className={cn('w-full space-y-1', className)}>
      {fileName && (
        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span className="max-w-[80%] truncate">{fileName}</span>
          <span>{progress}%</span>
        </div>
      )}
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
