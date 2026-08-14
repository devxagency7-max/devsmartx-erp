export type AllowedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
  | 'application/pdf'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export type FileCategory = 'image' | 'pdf' | 'excel' | 'word';

export type UploadQueueStatus =
  | 'waiting'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface UploadResult {
  readonly id: string;
  readonly url: string;
  readonly publicId: string;
  readonly fileName: string;
  readonly mimeType: AllowedMimeType;
  readonly extension: string;
  readonly size: number;
  readonly uploadedAt: string;
}

export interface UploadQueueItem {
  readonly id: string;
  readonly file: File;
  status: UploadQueueStatus;
  progress: number;
  result?: UploadResult;
  error?: string;
}

export interface UploadConfig {
  readonly maxFileSizeBytes: number;
  readonly maxFiles: number;
  readonly allowedTypes: ReadonlyArray<AllowedMimeType>;
  readonly folder?: string;
}

export interface CloudinaryUploadResponse {
  readonly public_id: string;
  readonly secure_url: string;
  readonly original_filename: string;
  readonly format: string;
  readonly bytes: number;
  readonly resource_type: string;
  readonly created_at: string;
}

export interface UploadValidationError {
  readonly file: string;
  readonly reason: 'unsupported_type' | 'file_too_large' | 'too_many_files';
  readonly message: string;
}
