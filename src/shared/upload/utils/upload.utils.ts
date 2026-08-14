import { ALLOWED_EXTENSIONS, isAllowedMimeType } from '../validation/upload.schema';
import type { AllowedMimeType } from '../types/upload.types';

export function generateUploadId(): string {
  return `upl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getExtension(mime: string): string {
  if (!isAllowedMimeType(mime)) return 'bin';
  return ALLOWED_EXTENSIONS[mime as AllowedMimeType];
}

/**
 * Builds a Cloudinary delivery URL with optional transformations.
 * Does not embed credentials — only cloud name and public_id are used.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'thumb';
  } = {},
): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  if (!cloudName) return '';

  const transforms: string[] = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  if (options.format) transforms.push(`f_${options.format}`);
  if (options.crop) transforms.push(`c_${options.crop}`);

  const transformStr = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`;
}

export function isImageType(mime: string): boolean {
  return mime.startsWith('image/');
}

export function isPdfType(mime: string): boolean {
  return mime === 'application/pdf';
}

export function getFileIcon(mime: string): 'image' | 'pdf' | 'spreadsheet' | 'document' | 'file' {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'spreadsheet';
  if (mime.includes('word') || mime.includes('wordprocessing')) return 'document';
  return 'file';
}
