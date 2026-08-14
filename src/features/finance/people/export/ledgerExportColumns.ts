import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { PersonLedgerEntry } from '../types/person.types';

export function getLedgerExportColumns(t: TFunction): ExportColumn<PersonLedgerEntry>[] {
  return [
    { key: 'reference', header: t('export.columns.referenceNumber'), accessor: (r) => r.reference, type: 'text', order: 1 },
    { key: 'date', header: t('commitment.paidAt'), accessor: (r) => r.date, type: 'date', order: 2 },
    { key: 'direction', header: t('person.direction'), accessor: (r) => t(`person.direction_${r.direction}`), type: 'enum', order: 3 },
    { key: 'amount', header: t('export.columns.amount'), accessor: (r) => r.amount, type: 'number', order: 4 },
    { key: 'currency', header: t('export.columns.currency'), accessor: (r) => r.currency, type: 'text', order: 5 },
    { key: 'reason', header: t('person.reason'), accessor: (r) => r.reason, type: 'text', order: 6 },
    { key: 'status', header: t('export.columns.status'), accessor: (r) => t(`person.entryStatus_${r.status}`), type: 'enum', order: 7 },
    { key: 'notes', header: t('person.notes'), accessor: (r) => r.notes, type: 'text', order: 8 },
  ];
}
