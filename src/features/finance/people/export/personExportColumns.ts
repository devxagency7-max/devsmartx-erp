import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { PersonRecord } from '../types/person.types';

export function getPersonExportColumns(t: TFunction): ExportColumn<PersonRecord>[] {
  return [
    { key: 'code', header: t('export.columns.code'), accessor: (r) => r.code, type: 'text', order: 1 },
    { key: 'name', header: t('export.columns.name'), accessor: (r) => r.name, type: 'text', order: 2 },
    { key: 'type', header: t('person.personType'), accessor: (r) => t(`person.type_${r.type}`), type: 'enum', order: 3 },
    { key: 'email', header: t('export.columns.email'), accessor: (r) => r.email ?? '', type: 'text', order: 4 },
    { key: 'phone', header: t('export.columns.phone'), accessor: (r) => r.phone ?? '', type: 'text', order: 5 },
    { key: 'status', header: t('export.columns.status'), accessor: (r) => t(`person.status_${r.status}`), type: 'enum', order: 6 },
    { key: 'notes', header: t('person.notes'), accessor: (r) => r.notes, type: 'text', order: 7 },
    { key: 'createdAt', header: t('export.columns.createdAt'), accessor: (r) => r.createdAt, type: 'datetime', order: 8 },
  ];
}
