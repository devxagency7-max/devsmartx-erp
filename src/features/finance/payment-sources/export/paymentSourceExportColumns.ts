import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { PaymentSourceRecord } from '../types/paymentSource.types';

export function getPaymentSourceExportColumns(t: TFunction): ExportColumn<PaymentSourceRecord>[] {
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
      key: 'type',
      header: t('export.columns.paymentSourceType'),
      type: 'enum',
      accessor: (r) => t(`paymentSource.type_${r.type}`),
      order: 3,
    },
    {
      key: 'currency',
      header: t('export.columns.currency'),
      type: 'text',
      accessor: (r) => r.currency,
      order: 4,
    },
    {
      key: 'status',
      header: t('export.columns.status'),
      type: 'enum',
      accessor: (r) => t(`paymentSource.status_${r.status}`),
      order: 5,
    },
    {
      key: 'description',
      header: t('export.columns.description'),
      type: 'text',
      accessor: (r) => r.description,
      order: 6,
    },
    {
      key: 'createdAt',
      header: t('export.columns.createdAt'),
      type: 'datetime',
      accessor: (r) => r.createdAt,
      order: 7,
    },
  ];
}
