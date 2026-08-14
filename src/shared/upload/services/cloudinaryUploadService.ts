import type { UploadResult, CloudinaryUploadResponse, AllowedMimeType } from '../types/upload.types';
import { validateFiles, isAllowedMimeType } from '../validation/upload.schema';
import { generateUploadId, getExtension } from '../utils/upload.utils';

function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials are not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.');
  }

  return { cloudName, uploadPreset };
}

export type UploadProgressCallback = (percent: number) => void;

export const cloudinaryUploadService = {
  /**
   * Uploads a single file to Cloudinary via unsigned upload preset.
   * Never throws on validation failure — returns null and calls onError.
   */
  async upload(
    file: File,
    options: {
      folder?: string;
      onProgress?: UploadProgressCallback;
    } = {},
  ): Promise<UploadResult> {
    const validationErrors = validateFiles([file]);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0].message);
    }

    const { cloudName, uploadPreset } = getCloudinaryConfig();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && options.onProgress) {
          options.onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          const mime = file.type as AllowedMimeType;
          resolve({
            id: generateUploadId(),
            url: response.secure_url,
            publicId: response.public_id,
            fileName: file.name,
            mimeType: isAllowedMimeType(mime) ? mime : 'application/octet-stream' as AllowedMimeType,
            extension: getExtension(file.type),
            size: response.bytes,
            uploadedAt: new Date().toISOString(),
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload was cancelled')));

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      xhr.send(formData);
    });
  },

  /**
   * Deletes a file from Cloudinary by public_id.
   * Requires a backend endpoint — placeholder returns true (unsigned deletion is not supported).
   */
  async delete(_publicId: string): Promise<boolean> {
    // Unsigned deletion requires a backend proxy with API secret.
    // This is a placeholder — implement via a backend endpoint in the API integration phase.
    return true;
  },

  /** Validates files before adding to queue. Returns validation errors. */
  validate: validateFiles,
};
