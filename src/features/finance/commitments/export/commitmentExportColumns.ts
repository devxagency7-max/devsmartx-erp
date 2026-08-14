import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { RecurringCommitmentRecord } from '../types/commitment.types';

export function getCommitmentExportColumns(t: TFunction): ExportColumn<RecurringCommitmentRecord>[] {
  return [
    { key: 'code', header: t('export.columns.code'), accessor: (r) => r.code, type: 'text', order: 1 },
    { key: 'name', header: t('export.columns.name'), accessor: (r) => r.name, type: 'text', order: 2 },
    { key: 'vendorName', header: t('commitment.vendor'), accessor: (r) => r.vendorName, type: 'text', order: 3 },
    { key: 'amount', header: t('export.columns.amount'), accessor: (r) => r.amount, type: 'number', order: 4 },
    { key: 'currency', header: t('export.columns.currency'), accessor: (r) => r.currency, type: 'text', order: 5 },
    { key: 'frequency', header: t('commitment.frequency'), accessor: (r) => t(`commitment.frequency_${r.frequency}`), type: 'enum', order: 6 },
    { key: 'status', header: t('export.columns.status'), accessor: (r) => t(`commitment.status_${r.status}`), type: 'enum', order: 7 },
    { key: 'nextDueDate', header: t('commitment.nextDueDate'), accessor: (r) => r.nextDueDate, type: 'date', order: 8 },
    { key: 'startDate', header: t('commitment.startDate'), accessor: (r) => r.startDate, type: 'date', order: 9 },
    { key: 'endDate', header: t('commitment.endDate'), accessor: (r) => r.endDate ?? '', type: 'date', order: 10 },
    { key: 'categoryName', header: t('export.columns.category'), accessor: (r) => r.categoryName ?? '', type: 'text', order: 11 },
    { key: 'notes', header: t('commitment.notes'), accessor: (r) => r.notes, type: 'text', order: 12 },
    { key: 'createdAt', header: t('export.columns.createdAt'), accessor: (r) => r.createdAt, type: 'datetime', order: 13 },
  ];
}
