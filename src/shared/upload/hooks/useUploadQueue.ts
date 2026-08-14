import { useState, useCallback } from 'react';
import type { UploadQueueItem, UploadResult, UploadConfig } from '../types/upload.types';
import { cloudinaryUploadService } from '../services/cloudinaryUploadService';
import { validateFiles, DEFAULT_UPLOAD_CONFIG } from '../validation/upload.schema';
import { generateUploadId } from '../utils/upload.utils';

interface UseUploadQueueReturn {
  queue: UploadQueueItem[];
  addFiles: (files: File[]) => string[];
  uploadAll: (folder?: string) => Promise<void>;
  retryItem: (id: string, folder?: string) => Promise<void>;
  cancelItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  isUploading: boolean;
  completedResults: UploadResult[];
}

export function useUploadQueue(config: Partial<UploadConfig> = {}): UseUploadQueueReturn {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const effectiveConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config };

  const addFiles = useCallback((files: File[]): string[] => {
    const errors = validateFiles(files, effectiveConfig);
    const validFiles = files.filter(
      (f) => !errors.some((e) => e.file === f.name),
    );
    const newItems: UploadQueueItem[] = validFiles.map((file) => ({
      id: generateUploadId(),
      file,
      status: 'waiting',
      progress: 0,
    }));
    setQueue((q) => [...q, ...newItems]);
    return newItems.map((i) => i.id);
  }, [effectiveConfig]);

  const uploadSingle = useCallback(async (item: UploadQueueItem, folder?: string): Promise<void> => {
    setQueue((q) => q.map((i) => i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i));

    try {
      const result = await cloudinaryUploadService.upload(item.file, {
        folder,
        onProgress: (percent) => {
          setQueue((q) => q.map((i) => i.id === item.id ? { ...i, progress: percent } : i));
        },
      });
      setQueue((q) => q.map((i) =>
        i.id === item.id ? { ...i, status: 'completed', progress: 100, result } : i,
      ));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      setQueue((q) => q.map((i) =>
        i.id === item.id ? { ...i, status: 'failed', error } : i,
      ));
    }
  }, []);

  const uploadAll = useCallback(async (folder?: string): Promise<void> => {
    const waiting = queue.filter((i) => i.status === 'waiting' || i.status === 'failed');
    if (waiting.length === 0) return;

    setIsUploading(true);
    await Promise.all(waiting.map((item) => uploadSingle(item, folder)));
    setIsUploading(false);
  }, [queue, uploadSingle]);

  const retryItem = useCallback(async (id: string, folder?: string): Promise<void> => {
    const item = queue.find((i) => i.id === id);
    if (!item) return;
    setQueue((q) => q.map((i) => i.id === id ? { ...i, status: 'waiting', progress: 0, error: undefined } : i));
    await uploadSingle({ ...item, status: 'waiting', progress: 0 }, folder);
  }, [queue, uploadSingle]);

  const cancelItem = useCallback((id: string): void => {
    setQueue((q) => q.map((i) =>
      i.id === id && (i.status === 'waiting' || i.status === 'uploading')
        ? { ...i, status: 'cancelled' }
        : i,
    ));
  }, []);

  const removeItem = useCallback((id: string): void => {
    setQueue((q) => q.filter((i) => i.id !== id));
  }, []);

  const clearCompleted = useCallback((): void => {
    setQueue((q) => q.filter((i) => i.status !== 'completed' && i.status !== 'cancelled'));
  }, []);

  const clearAll = useCallback((): void => {
    setQueue([]);
  }, []);

  const completedResults = queue
    .filter((i) => i.status === 'completed' && i.result)
    .map((i) => i.result!);

  return {
    queue,
    addFiles,
    uploadAll,
    retryItem,
    cancelItem,
    removeItem,
    clearCompleted,
    clearAll,
    isUploading,
    completedResults,
  };
}
