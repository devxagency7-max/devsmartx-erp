import { useState, useCallback } from 'react';
import type { UploadResult, UploadConfig } from '../types/upload.types';
import { cloudinaryUploadService } from '../services/cloudinaryUploadService';
import { validateFiles } from '../validation/upload.schema';

interface UseUploadState {
  isUploading: boolean;
  progress: number;
  result: UploadResult | null;
  error: string | null;
}

interface UseUploadReturn extends UseUploadState {
  upload: (file: File, folder?: string) => Promise<UploadResult | null>;
  reset: () => void;
}

export function useUpload(config?: Partial<UploadConfig>): UseUploadReturn {
  const [state, setState] = useState<UseUploadState>({
    isUploading: false,
    progress: 0,
    result: null,
    error: null,
  });

  const upload = useCallback(async (file: File, folder?: string): Promise<UploadResult | null> => {
    if (config) {
      const errors = validateFiles([file], { maxFileSizeBytes: 10 * 1024 * 1024, maxFiles: 1, allowedTypes: config.allowedTypes ?? [], ...config });
      if (errors.length > 0) {
        setState((s) => ({ ...s, error: errors[0].message }));
        return null;
      }
    }

    setState({ isUploading: true, progress: 0, result: null, error: null });

    try {
      const result = await cloudinaryUploadService.upload(file, {
        folder,
        onProgress: (percent) => setState((s) => ({ ...s, progress: percent })),
      });
      setState({ isUploading: false, progress: 100, result, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setState({ isUploading: false, progress: 0, result: null, error: message });
      return null;
    }
  }, [config]);

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, result: null, error: null });
  }, []);

  return { ...state, upload, reset };
}
