import type { ExportConfig, ExportValidationResult, IExcelExportProvider, WorkbookConfig } from '../types/export.types';
import { DEFAULT_AUTO_WIDTH, DEFAULT_COMPANY_NAME, DEFAULT_FREEZE_HEADER } from '../config/exportDefaults';
import { formatForExcel } from '../utils/excelFormatter';
import { sanitizeSheetName } from '../utils/fileNameGenerator';
import { validateExportConfig } from '../validation/export.schema';

type AoaRow = (string | number)[];

function buildMetadataRows<T>(config: ExportConfig<T>): AoaRow[] {
  const rows: AoaRow[] = [];
  if (config.title) {
    rows.push([config.title]);
  }
  if (config.includeMetadata !== false) {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    rows.push([`${DEFAULT_COMPANY_NAME}`, '', `Exported: ${now}`, '', `Mode: ${config.exportMode ?? 'all'}`, '', `Rows: ${config.data.length}`]);
  }
  return rows;
}

function prepareRows<T>(config: ExportConfig<T>): AoaRow[] {
  const visibleColumns = config.columns
    .filter((col) => col.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return config.data.map((row) =>
    visibleColumns.map((col) => {
      const rawValue = col.accessor(row);
      if (col.formatter) {
        return col.formatter(rawValue, row, config.locale);
      }
      return formatForExcel(rawValue, col.type, config.locale);
    }),
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateWorksheet<T>(config: ExportConfig<T>, XLSX: any): Promise<any> {
  const visibleColumns = config.columns
    .filter((col) => col.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const metaRows = buildMetadataRows(config);
  const headerRow: AoaRow = visibleColumns.map((col) => col.header);
  const dataRows = prepareRows(config);

  const allRows: AoaRow[] = [...metaRows, headerRow, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Column widths
  if (config.autoWidth !== false && DEFAULT_AUTO_WIDTH) {
    const colWidths = visibleColumns.map((col, colIndex) => {
      const headerLen = col.width ?? col.header.length;
      const maxDataLen = dataRows.reduce((max, row) => {
        const cellStr = String(row[colIndex] ?? '');
        return Math.max(max, cellStr.length);
      }, 0);
      return { wch: Math.min(Math.max(headerLen, maxDataLen) + 2, 60) };
    });
    ws['!cols'] = colWidths;
  }

  // Header freeze
  if (config.freezeHeader !== false && DEFAULT_FREEZE_HEADER && metaRows.length + 1 > 0) {
    const freezeRow = metaRows.length + 1;
    ws['!freeze'] = {
      xSplit: 0,
      ySplit: freezeRow,
      topLeftCell: `A${freezeRow + 1}`,
      activePane: 'bottomLeft',
      state: 'frozen',
    };
  }

  // RTL for Arabic
  if (config.direction === 'rtl') {
    ws['!views'] = [{ rightToLeft: true }];
  }

  return ws;
}

export function validateExport<T>(config: ExportConfig<T>): ExportValidationResult {
  return validateExportConfig(config);
}

export async function exportToExcel<T>(config: ExportConfig<T>): Promise<void> {
  const validation = validateExportConfig(config);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const ws = await generateWorksheet(config, XLSX);
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(config.sheetName));
  XLSX.writeFile(wb, config.fileName);
}

export async function exportWorkbook(config: WorkbookConfig): Promise<void> {
  if (!config.sheets.length) {
    throw new Error('WorkbookConfig must have at least one sheet.');
  }

  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  for (const sheetConfig of config.sheets) {
    const ws = await generateWorksheet(sheetConfig, XLSX);
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetConfig.sheetName));
  }

  XLSX.writeFile(wb, config.fileName);
}

export class ClientSideExcelExportProvider implements IExcelExportProvider {
  async exportToExcel<T>(config: ExportConfig<T>): Promise<void> {
    return exportToExcel(config);
  }

  async exportWorkbook(config: WorkbookConfig): Promise<void> {
    return exportWorkbook(config);
  }
}

export const excelExportService = new ClientSideExcelExportProvider();
