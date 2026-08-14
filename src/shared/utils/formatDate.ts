import { parseISO, format } from 'date-fns';

/**
 * Format a UTC ISO 8601 string for display.
 * All dates are stored as UTC — convert to display format only at the presentation layer.
 */
export function formatDate(isoString: string, displayFormat = 'dd MMM yyyy'): string {
  return format(parseISO(isoString), displayFormat);
}

export function formatDateTime(isoString: string): string {
  return format(parseISO(isoString), 'dd MMM yyyy, HH:mm');
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function nowISOString(): string {
  return new Date().toISOString();
}
