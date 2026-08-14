import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PdfPreviewProps {
  url: string;
  fileName?: string;
  className?: string;
}

export function PdfPreview({ url, fileName, className }: PdfPreviewProps) {
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3', className)}>
      <FileText className="h-8 w-8 shrink-0 text-[hsl(var(--destructive))]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
          {fileName ?? 'Document.pdf'}
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">PDF</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80"
        aria-label="Open PDF in new tab"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
