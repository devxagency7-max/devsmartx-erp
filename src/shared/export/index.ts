// Types
export type {
  ExportConfig,
  ExportColumn,
  ExportColumnType,
  ExportMode,
  ExportState,
  ExportProgressState,
  WorkbookConfig,
  ExportValidationResult,
  ExportAuditEntry,
  IExcelExportProvider,
} from './types/export.types';

// Config
export {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_COMPANY_NAME,
  DEFAULT_FREEZE_HEADER,
  DEFAULT_AUTO_WIDTH,
  MAX_ROWS_CLIENT_SIDE,
} from './config/exportDefaults';

// Service — xlsx itself is NOT re-exported
export {
  excelExportService,
  ClientSideExcelExportProvider,
  exportToExcel,
  exportWorkbook,
  validateExport,
} from './services/excelExportService';

// Utils
export {
  generateFileName,
  sanitizeFileName,
  sanitizeSheetName,
} from './utils/fileNameGenerator';

export { formatForExcel } from './utils/excelFormatter';

// exportSanitizer is intentionally NOT exported — internal use only

// Hook
export { useExcelExport } from './hooks/useExcelExport';

// Components
export { ExportButton } from './components/ExportButton';
export { ExportProgress } from './components/ExportProgress';
