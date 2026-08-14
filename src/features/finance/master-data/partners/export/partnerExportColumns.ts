import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { PartnerRecord } from '../types/partner.types';

export function getPartnerExportColumns(
  t: TFunction,
): ExportColumn<PartnerRecord>[] {
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
      key: 'email',
      header: t('export.columns.email'),
      type: 'text',
      accessor: (r) => r.email ?? '',
      order: 3,
    },
    {
      key: 'phone',
      header: t('export.columns.phone'),
      type: 'text',
      accessor: (r) => r.phone ?? '',
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
