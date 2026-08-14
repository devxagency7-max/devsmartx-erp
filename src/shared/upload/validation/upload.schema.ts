import type { AllowedMimeType, UploadConfig, UploadValidationError } from '../types/upload.types';

export const ALLOWED_MIME_TYPES: ReadonlyArray<AllowedMimeType> = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_EXTENSIONS: Readonly<Record<AllowedMimeType, string>> = {
  'image/jpeg':     'jpg',
  'image/png':      'png',
  'image/gif':      'gif',
  'image/webp':     'webp',
  'image/svg+xml':  'svg',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
  maxFiles: 10,
  allowedTypes: ALLOWED_MIME_TYPES,
};

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as ReadonlyArray<string>).includes(mime);
}

export function validateFiles(
  files: File[],
  config: UploadConfig = DEFAULT_UPLOAD_CONFIG,
): UploadValidationError[] {
  const errors: UploadValidationError[] = [];

  if (files.length > config.maxFiles) {
    errors.push({
      file: '',
      reason: 'too_many_files',
      message: `Maximum ${config.maxFiles} files allowed`,
    });
    return errors;
  }

  for (const file of files) {
    if (!isAllowedMimeType(file.type) || !(config.allowedTypes as ReadonlyArray<string>).includes(file.type)) {
      errors.push({
        file: file.name,
        reason: 'unsupported_type',
        message: `File type "${file.type}" is not supported`,
      });
    } else if (file.size > config.maxFileSizeBytes) {
      const maxMB = (config.maxFileSizeBytes / 1024 / 1024).toFixed(0);
      errors.push({
        file: file.name,
        reason: 'file_too_large',
        message: `File "${file.name}" exceeds the ${maxMB} MB limit`,
      });
    }
  }

  return errors;
}

export function getFileCategory(mime: string): 'image' | 'pdf' | 'excel' | 'word' | 'unknown' {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'application/vnd.ms-excel' || mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'excel';
  if (mime === 'application/msword' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'word';
  return 'unknown';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
