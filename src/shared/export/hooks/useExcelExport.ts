import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { ExportConfig, ExportProgressState, ExportState } from '../types/export.types';
import { excelExportService, validateExport } from '../services/excelExportService';
import { MAX_ROWS_CLIENT_SIDE } from '../config/exportDefaults';

interface ExcelExportState {
  exportState: ExportState;
  progress: ExportProgressState;
  error: string | null;
}

const IDLE_STATE: ExcelExportState = {
  exportState: 'idle',
  progress: { stage: 'idle', percent: 0, message: '' },
  error: null,
};

interface UseExcelExportReturn {
  exportData: <T>(config: ExportConfig<T>) => Promise<void>;
  isExporting: boolean;
  progress: ExportProgressState;
  error: string | null;
  state: ExportState;
  reset: () => void;
}

export function useExcelExport(): UseExcelExportReturn {
  const { t } = useTranslation();
  const [exportState, setExportState] = useState<ExcelExportState>(IDLE_STATE);

  const exportData = useCallback(
    async <T>(config: ExportConfig<T>) => {
      const validation = validateExport(config);

      if (!validation.valid) {
        setExportState({
          exportState: 'failed',
          progress: { stage: 'failed', percent: 0, message: validation.errors.join('; ') },
          error: validation.errors.join('; '),
        });
        toast.error(t('export.failed'));
        return;
      }

      if (config.data.length === 0) {
        toast.error(t('export.noData'));
        return;
      }

      if (config.data.length > MAX_ROWS_CLIENT_SIDE) {
        toast(t('export.rowsWarning', { count: config.data.length }), { duration: 4000 });
      }

      setExportState({
        exportState: 'preparing',
        progress: { stage: 'preparing', percent: 10, message: t('export.preparing') },
        error: null,
      });

      try {
        setExportState((s) => ({
          ...s,
          exportState: 'generating',
          progress: { stage: 'generating', percent: 50, message: t('export.generating') },
        }));

        await excelExportService.exportToExcel(config);

        setExportState((s) => ({
          ...s,
          exportState: 'downloading',
          progress: { stage: 'downloading', percent: 90, message: t('export.downloading') },
        }));

        await new Promise<void>((resolve) => setTimeout(resolve, 300));

        setExportState({
          exportState: 'completed',
          progress: { stage: 'completed', percent: 100, message: t('export.completed') },
          error: null,
        });
        toast.success(t('export.completed'));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t('common.errors.unknown');
        setExportState({
          exportState: 'failed',
          progress: { stage: 'failed', percent: 0, message },
          error: message,
        });
        toast.error(t('export.failed'));
      }
    },
    [t],
  );

  const reset = useCallback(() => {
    setExportState(IDLE_STATE);
  }, []);

  const isExporting =
    exportState.exportState === 'preparing' ||
    exportState.exportState === 'generating' ||
    exportState.exportState === 'downloading';

  return {
    exportData,
    isExporting,
    progress: exportState.progress,
    error: exportState.error,
    state: exportState.exportState,
    reset,
  };
}
