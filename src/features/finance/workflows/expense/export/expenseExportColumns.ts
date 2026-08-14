import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { TransactionRecord } from '@/features/finance/transactions/types/transaction.types';

export function getExpenseExportColumns(
  t: TFunction,
): ExportColumn<TransactionRecord>[] {
  return [
    {
      key: 'referenceNumber',
      header: t('export.columns.referenceNumber'),
      type: 'text',
      accessor: (r) => r.referenceNumber,
      order: 1,
    },
    {
      key: 'categoryName',
      header: t('export.columns.category'),
      type: 'text',
      accessor: (r) => r.categoryName ?? '',
      order: 2,
    },
    {
      key: 'paymentSourceName',
      header: t('export.columns.paymentSource'),
      type: 'text',
      accessor: (r) => r.paymentSourceName,
      order: 3,
    },
    {
      key: 'amount',
      header: t('export.columns.amount'),
      type: 'number',
      accessor: (r) => r.amount,
      order: 4,
    },
    {
      key: 'currency',
      header: t('export.columns.currency'),
      type: 'text',
      accessor: (r) => r.currency,
      order: 5,
    },
    {
      key: 'paymentMethod',
      header: t('export.columns.paymentMethod'),
      type: 'enum',
      accessor: (r) => t(`transaction.pm_${r.paymentMethod}`),
      order: 6,
    },
    {
      key: 'transactionDate',
      header: t('export.columns.transactionDate'),
      type: 'date',
      accessor: (r) => r.transactionDate,
      order: 7,
    },
    {
      key: 'partnerName',
      header: t('export.columns.partner'),
      type: 'text',
      accessor: (r) => r.partnerName ?? '',
      order: 8,
    },
    {
      key: 'description',
      header: t('export.columns.description'),
      type: 'text',
      accessor: (r) => r.description,
      order: 9,
    },
    {
      key: 'status',
      header: t('export.columns.status'),
      type: 'enum',
      accessor: (r) => t(`transaction.status_${r.status}`),
      order: 10,
    },
    {
      key: 'createdBy',
      header: t('export.columns.createdBy'),
      type: 'text',
      accessor: (r) => r.createdBy,
      order: 11,
    },
    {
      key: 'createdAt',
      header: t('export.columns.createdAt'),
      type: 'datetime',
      accessor: (r) => r.createdAt,
      order: 12,
    },
    {
      key: 'attachmentCount',
      header: t('export.columns.attachmentCount'),
      type: 'number',
      accessor: (r) => r.attachments.length,
      order: 13,
    },
  ];
}
