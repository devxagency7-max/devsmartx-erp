import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { CategoryRecord } from '../types/category.types';

export function getCategoryExportColumns(
  t: TFunction,
): ExportColumn<CategoryRecord>[] {
  return [
    {
      key: 'code',
      header: t('export.columns.code'),
      type: 'text',
      accessor: (r) => r.code,
      order: 1,
    },
    {
      key: 'name',
      header: t('export.columns.name'),
      type: 'text',
      accessor: (r) => r.name,
      order: 2,
    },
    {
      key: 'parentName',
      header: t('export.columns.parentCategory'),
      type: 'text',
      accessor: (r) => r.parentName ?? '',
      order: 3,
    },
    {
      key: 'applicableTypes',
      header: t('export.columns.applicableTypes'),
      type: 'text',
      accessor: (r) =>
        r.applicableTypes
          .map((type) => t(`transaction.type_${type}`))
          .join(', '),
      order: 4,
    },
    {
      key: 'status',
      header: t('export.columns.status'),
      type: 'enum',
      accessor: (r) => t(`masterData.status.${r.status}`),
      order: 5,
    },
    {
      key: 'createdAt',
      header: t('export.columns.createdAt'),
      type: 'datetime',
      accessor: (r) => r.createdAt,
      order: 6,
    },
  ];
}
