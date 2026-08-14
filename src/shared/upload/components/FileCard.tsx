import { X, RefreshCw, FileText, FileSpreadsheet, File, ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { UploadProgress } from './UploadProgress';
import { formatFileSize, getFileCategory } from '../validation/upload.schema';
import type { UploadQueueItem } from '../types/upload.types';

interface FileCardProps {
  item: UploadQueueItem;
  onRemove?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

function FileTypeIcon({ mime }: { mime: string }) {
  const category = getFileCategory(mime);
  const cls = 'h-8 w-8 shrink-0';
  if (category === 'image') return <ImageIcon className={cn(cls, 'text-[hsl(var(--primary))]')} />;
  if (category === 'pdf') return <FileText className={cn(cls, 'text-[hsl(var(--destructive))]')} />;
  if (category === 'excel') return <FileSpreadsheet className={cn(cls, 'text-green-600')} />;
  if (category === 'word') return <FileText className={cn(cls, 'text-blue-600')} />;
  return <File className={cn(cls, 'text-[hsl(var(--muted-foreground))]')} />;
}

function StatusIcon({ status }: { status: UploadQueueItem['status'] }) {
  if (status === 'uploading') return <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />;
  if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (status === 'failed') return <AlertCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />;
  return null;
}

export function FileCard({ item, onRemove, onCancel, onRetry, className }: FileCardProps) {
  const { file, status, progress, error } = item;
  const isActive = status === 'uploading';
  const isFailed = status === 'failed';

  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3',
      isFailed && 'border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/5',
      className,
    )}>
      <FileTypeIcon mime={file.type} />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-sm font-medium text-[hsl(var(--foreground))]">
            {file.name}
          </span>
          <StatusIcon status={status} />
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {formatFileSize(file.size)}
        </p>
        {isActive && (
          <UploadProgress progress={progress} />
        )}
        {isFailed && error && (
          <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isFailed && onRetry && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRetry(item.id)}
            aria-label="Retry upload"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
        {isActive && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onCancel(item.id)}
            aria-label="Cancel upload"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
        {!isActive && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRemove(item.id)}
            aria-label="Remove file"
            disabled={false}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
