import { z } from 'zod';
import type { ExportConfig, ExportValidationResult } from '../types/export.types';
import { MAX_ROWS_CLIENT_SIDE } from '../config/exportDefaults';

const ExportColumnSchema = z.object({
  key: z.string().min(1),
  header: z.string().min(1),
  accessor: z.function(),
  type: z.enum(['text', 'number', 'date', 'datetime', 'currency', 'boolean', 'enum']),
  visible: z.boolean().optional(),
  order: z.number().optional(),
  width: z.number().positive().optional(),
  formatter: z.function().optional(),
});

const ExportConfigSchema = z.object({
  fileName: z.string().min(1).max(200),
  sheetName: z.string().min(1).max(31),
  data: z.array(z.unknown()),
  columns: z.array(ExportColumnSchema).min(1),
  locale: z.string().min(1),
  direction: z.enum(['ltr', 'rtl']).optional(),
});

export function validateExportConfig<T>(config: ExportConfig<T>): ExportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const result = ExportConfigSchema.safeParse(config);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    }
  }

  if (config.data.length === 0) {
    warnings.push('No data to export.');
  }

  if (config.data.length > MAX_ROWS_CLIENT_SIDE) {
    warnings.push(
      `Large export: ${config.data.length} rows may take a moment.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}
