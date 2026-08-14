import { useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { UploadDropzone } from './UploadDropzone';
import { FileCard } from './FileCard';
import { UploadPreview } from './UploadPreview';
import { useUploadQueue } from '../hooks/useUploadQueue';
import type { UploadConfig, UploadResult } from '../types/upload.types';

interface FileUploaderProps {
  onUploadComplete?: (results: UploadResult[]) => void;
  config?: Partial<UploadConfig>;
  folder?: string;
  disabled?: boolean;
  showPreview?: boolean;
  label?: string;
  className?: string;
}

export function FileUploader({
  onUploadComplete,
  config,
  folder,
  disabled = false,
  showPreview = true,
  label,
  className,
}: FileUploaderProps) {
  const {
    queue,
    addFiles,
    uploadAll,
    retryItem,
    cancelItem,
    removeItem,
    clearCompleted,
    isUploading,
    completedResults,
  } = useUploadQueue(config);

  const handleFilesSelected = useCallback((files: File[]) => {
    addFiles(files);
  }, [addFiles]);

  const handleUploadAll = useCallback(async () => {
    await uploadAll(folder);
    if (onUploadComplete) {
      const results = queue
        .filter((i) => i.status === 'completed' && i.result)
        .map((i) => i.result!);
      if (results.length > 0) onUploadComplete(results);
    }
  }, [uploadAll, folder, onUploadComplete, queue]);

  const hasPending = queue.some((i) => i.status === 'waiting' || i.status === 'failed');

  return (
    <div className={cn('space-y-3', className)}>
      <UploadDropzone
        onFilesSelected={handleFilesSelected}
        config={config}
        disabled={disabled || isUploading}
        label={label}
      />

      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item) => (
            <FileCard
              key={item.id}
              item={item}
              onRemove={removeItem}
              onCancel={cancelItem}
              onRetry={(id) => retryItem(id, folder)}
            />
          ))}

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCompleted}
              className="text-xs text-[hsl(var(--muted-foreground))]"
            >
              Clear completed
            </Button>
            {hasPending && (
              <Button
                type="button"
                size="sm"
                onClick={handleUploadAll}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : `Upload ${queue.filter((i) => i.status === 'waiting').length} file(s)`}
              </Button>
            )}
          </div>
        </div>
      )}

      {showPreview && completedResults.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {completedResults.map((result) => (
            <UploadPreview key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}
