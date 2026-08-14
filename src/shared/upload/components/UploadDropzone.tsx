import { useRef, useState, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { EmptyUploadState } from './EmptyUploadState';
import { validateFiles, DEFAULT_UPLOAD_CONFIG, formatFileSize } from '../validation/upload.schema';
import type { UploadConfig, UploadValidationError } from '../types/upload.types';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  config?: Partial<UploadConfig>;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function UploadDropzone({
  onFilesSelected,
  config,
  disabled = false,
  className,
  label,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<UploadValidationError[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const effectiveConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config };

  const processFiles = useCallback((files: File[]) => {
    const errors = validateFiles(files, effectiveConfig);
    setValidationErrors(errors);
    if (errors.length === 0) {
      onFilesSelected(files);
    } else {
      // Pass valid files only
      const invalid = new Set(errors.map((e) => e.file));
      const valid = files.filter((f) => !invalid.has(f.name));
      if (valid.length > 0) onFilesSelected(valid);
    }
  }, [effectiveConfig, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    processFiles(Array.from(e.dataTransfer.files));
  }, [disabled, processFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  }, [processFiles]);

  const acceptAttr = effectiveConfig.allowedTypes.join(',');
  const maxMB = formatFileSize(effectiveConfig.maxFileSizeBytes);
  const hint = `Up to ${effectiveConfig.maxFiles} files · Max ${maxMB} each`;

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload dropzone"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'cursor-pointer rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 transition-colors',
          'hover:border-[hsl(var(--primary))]/60 hover:bg-[hsl(var(--muted))]/60',
          isDragging && 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <EmptyUploadState label={label} hint={hint} />
        <input
          ref={inputRef}
          type="file"
          multiple={effectiveConfig.maxFiles > 1}
          accept={acceptAttr}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
        />
      </div>
      {validationErrors.length > 0 && (
        <ul className="space-y-0.5">
          {validationErrors.map((err, i) => (
            <li key={i} className="text-xs text-[hsl(var(--destructive))]">
              {err.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
