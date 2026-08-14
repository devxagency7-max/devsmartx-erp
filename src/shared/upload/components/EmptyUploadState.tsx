import { UploadCloud } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface EmptyUploadStateProps {
  label?: string;
  hint?: string;
  className?: string;
}

export function EmptyUploadState({
  label = 'Drop files here or click to upload',
  hint,
  className,
}: EmptyUploadStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-8 text-center', className)}>
      <UploadCloud className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
      {hint && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
    </div>
  );
}
