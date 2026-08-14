import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt = 'Image preview', className }: ImagePreviewProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={cn('flex items-center justify-center rounded bg-[hsl(var(--muted))]', className)}>
        <ImageIcon className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={cn('rounded object-cover', className)}
    />
  );
}
