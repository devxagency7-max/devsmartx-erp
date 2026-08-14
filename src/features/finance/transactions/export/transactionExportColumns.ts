import type { TFunction } from 'i18next';
import type { ExportColumn } from '@/shared/export';
import type { TransactionRecord } from '../types/transaction.types';

export function getTransactionExportColumns(
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
      key: 'type',
      header: t('export.columns.type'),
      type: 'enum',
      accessor: (r) => t(`transaction.type_${r.type}`),
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
      key: 'destinationPaymentSourceName',
      header: t('export.columns.destinationPaymentSource'),
      type: 'text',
      accessor: (r) => r.destinationPaymentSourceName ?? '',
      order: 4,
    },
    {
      key: 'amount',
      header: t('export.columns.amount'),
      type: 'number',
      accessor: (r) => r.amount,
      order: 5,
    },
    {
      key: 'currency',
      header: t('export.columns.currency'),
      type: 'text',
      accessor: (r) => r.currency,
      order: 6,
    },
    {
      key: 'paymentMethod',
      header: t('export.columns.paymentMethod'),
      type: 'enum',
      accessor: (r) => t(`transaction.pm_${r.paymentMethod}`),
      order: 7,
    },
    {
      key: 'categoryName',
      header: t('export.columns.category'),
      type: 'text',
      accessor: (r) => r.categoryName ?? '',
      order: 8,
    },
    {
      key: 'transactionDate',
      header: t('export.columns.transactionDate'),
      type: 'date',
      accessor: (r) => r.transactionDate,
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
      key: 'description',
      header: t('export.columns.description'),
      type: 'text',
      accessor: (r) => r.description,
      order: 11,
    },
    {
      key: 'createdBy',
      header: t('export.columns.createdBy'),
      type: 'text',
      accessor: (r) => r.createdBy,
      order: 12,
    },
    {
      key: 'createdAt',
      header: t('export.columns.createdAt'),
      type: 'datetime',
      accessor: (r) => r.createdAt,
      order: 13,
    },
    {
      key: 'attachmentCount',
      header: t('export.columns.attachmentCount'),
      type: 'number',
      accessor: (r) => r.attachments.length,
      order: 14,
    },
  ];
}
