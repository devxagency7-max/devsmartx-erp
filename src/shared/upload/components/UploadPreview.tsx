import { isImageType, isPdfType } from '../utils/upload.utils';
import { ImagePreview } from './ImagePreview';
import { PdfPreview } from './PdfPreview';
import { File } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { UploadResult } from '../types/upload.types';

interface UploadPreviewProps {
  result: UploadResult;
  className?: string;
}

export function UploadPreview({ result, className }: UploadPreviewProps) {
  if (isImageType(result.mimeType)) {
    return (
      <ImagePreview
        src={result.url}
        alt={result.fileName}
        className={cn('h-32 w-full', className)}
      />
    );
  }

  if (isPdfType(result.mimeType)) {
    return <PdfPreview url={result.url} fileName={result.fileName} className={className} />;
  }

  return (
    <div className={cn('flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-3', className)}>
      <File className="h-6 w-6 shrink-0 text-[hsl(var(--muted-foreground))]" />
      <span className="truncate text-sm text-[hsl(var(--foreground))]">{result.fileName}</span>
    </div>
  );
}
