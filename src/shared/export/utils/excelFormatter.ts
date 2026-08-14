import { format, parseISO, isValid } from 'date-fns';
import type { ExportColumnType } from '../types/export.types';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from '../config/exportDefaults';

function formatBooleanForLocale(value: boolean, locale: string): string {
  if (locale === 'ar') return value ? 'نعم' : 'لا';
  return value ? 'Yes' : 'No';
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  }
  return null;
}

export function formatForExcel(
  value: unknown,
  type: ExportColumnType,
  locale: string,
): string | number {
  if (value === null || value === undefined) return '';

  switch (type) {
    case 'text':
    case 'enum':
      return String(value);

    case 'number':
    case 'currency': {
      if (typeof value === 'number') return value;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }

    case 'date': {
      const d = parseDate(value);
      if (!d) return String(value);
      return format(d, DEFAULT_DATE_FORMAT);
    }

    case 'datetime': {
      const d = parseDate(value);
      if (!d) return String(value);
      return format(d, DEFAULT_DATETIME_FORMAT);
    }

    case 'boolean':
      return formatBooleanForLocale(Boolean(value), locale);

    default:
      return String(value);
  }
}
