import { format } from 'date-fns';
import type { ExportMode } from '../types/export.types';
import {
  DEFAULT_COMPANY_NAME,
  EXCEL_MAX_SHEET_NAME_LENGTH,
  INVALID_FILE_NAME_CHARS,
  INVALID_SHEET_NAME_CHARS,
} from '../config/exportDefaults';

export function sanitizeFileName(name: string): string {
  return name
    .replace(INVALID_FILE_NAME_CHARS, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 200);
}

export function sanitizeSheetName(name: string): string {
  const sanitized = name
    .replace(INVALID_SHEET_NAME_CHARS, '_')
    .trim()
    .slice(0, EXCEL_MAX_SHEET_NAME_LENGTH);
  return sanitized || 'Sheet1';
}

const MODE_LABELS: Record<ExportMode, string | null> = {
  all: null,
  filtered: 'Filtered',
  selected: 'Selected',
  page: 'Page',
};

export function generateFileName(
  module: string,
  mode: ExportMode,
  date: Date,
  _locale: string,
): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const modeLabel = MODE_LABELS[mode];
  const parts = [DEFAULT_COMPANY_NAME, module];
  if (modeLabel) parts.push(modeLabel);
  parts.push(dateStr);
  const name = parts.join('_') + '.xlsx';
  return sanitizeFileName(name);
}
