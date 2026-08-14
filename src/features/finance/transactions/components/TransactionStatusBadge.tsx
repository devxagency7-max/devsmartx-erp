import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/badge';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';

const VARIANT_MAP: Record<
  TransactionStatus,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
  [TransactionStatus.Draft]:      'outline',
  [TransactionStatus.Pending]:    'warning',
  [TransactionStatus.Approved]:   'default',
  [TransactionStatus.Completed]:  'success',
  [TransactionStatus.Cancelled]:  'secondary',
  [TransactionStatus.Rejected]:   'destructive',
};

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT_MAP[status]}>
      {t(`transaction.status_${status}`)}
    </Badge>
  );
}
