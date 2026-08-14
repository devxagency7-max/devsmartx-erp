export type ExportMode = 'all' | 'filtered' | 'selected' | 'page';

export type ExportState =
  | 'idle'
  | 'preparing'
  | 'generating'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ExportColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'currency'
  | 'boolean'
  | 'enum';

export interface ExportProgressState {
  stage: ExportState;
  percent: number;
  message: string;
}

export interface ExportColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => unknown;
  formatter?: (value: unknown, _row: T, locale: string) => string | number;
  width?: number;
  type: ExportColumnType;
  visible?: boolean;
  order?: number;
}

export interface ExportConfig<T> {
  fileName: string;
  sheetName: string;
  title?: string;
  data: T[];
  columns: ExportColumn<T>[];
  locale: string;
  direction?: 'ltr' | 'rtl';
  includeHeaders?: boolean;
  includeMetadata?: boolean;
  dateFormat?: string;
  autoWidth?: boolean;
  freezeHeader?: boolean;
  exportMode?: ExportMode;
  filters?: Record<string, unknown>;
  selectedIds?: string[];
}

export interface WorkbookConfig {
  fileName: string;
  sheets: ExportConfig<unknown>[];
}

export interface ExportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExportAuditEntry {
  exportedAt: string;
  exportedBy: string;
  module: string;
  mode: ExportMode;
  rowCount: number;
  locale: string;
}

export interface IExcelExportProvider {
  exportToExcel<T>(config: ExportConfig<T>): Promise<void>;
  exportWorkbook(config: WorkbookConfig): Promise<void>;
}
