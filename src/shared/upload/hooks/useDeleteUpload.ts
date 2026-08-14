import { useState, useCallback } from 'react';
import { cloudinaryUploadService } from '../services/cloudinaryUploadService';

interface UseDeleteUploadReturn {
  isDeleting: boolean;
  error: string | null;
  deleteUpload: (publicId: string) => Promise<boolean>;
  reset: () => void;
}

export function useDeleteUpload(): UseDeleteUploadReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUpload = useCallback(async (publicId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);
    try {
      const success = await cloudinaryUploadService.delete(publicId);
      setIsDeleting(false);
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      setIsDeleting(false);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setIsDeleting(false);
    setError(null);
  }, []);

  return { isDeleting, error, deleteUpload, reset };
}
