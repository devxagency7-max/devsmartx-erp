import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { useTransactionStore } from '../store/transactionStore';

const TX_TYPES = Object.values(TransactionType);
const TX_STATUSES = Object.values(TransactionStatus);

export function TransactionFiltersBar() {
  const { t } = useTranslation();
  const { filters, setFilters, resetFilters } = useTransactionStore();

  const hasActive =
    filters.search ||
    filters.type ||
    filters.paymentSourceId ||
    filters.status ||
    filters.currency ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder={t('transaction.filters.searchPlaceholder')}
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="h-8 w-60"
      />

      <Select
        value={filters.type || '__all__'}
        onValueChange={(v) =>
          setFilters({ type: v === '__all__' ? '' : (v as TransactionType) })
        }
      >
        <SelectTrigger className="h-8 w-44">
          <SelectValue placeholder={t('transaction.filters.typeAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t('transaction.filters.typeAll')}</SelectItem>
          {TX_TYPES.map((tt) => (
            <SelectItem key={tt} value={tt}>
              {t(`transaction.type_${tt}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status || '__all__'}
        onValueChange={(v) =>
          setFilters({ status: v === '__all__' ? '' : (v as TransactionStatus) })
        }
      >
        <SelectTrigger className="h-8 w-40">
          <SelectValue placeholder={t('transaction.filters.statusAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{t('transaction.filters.statusAll')}</SelectItem>
          {TX_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`transaction.status_${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date range */}
      <Input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => setFilters({ dateFrom: e.target.value })}
        className="h-8 w-36"
        aria-label={t('transaction.filters.dateFrom')}
      />
      <Input
        type="date"
        value={filters.dateTo}
        onChange={(e) => setFilters({ dateTo: e.target.value })}
        className="h-8 w-36"
        aria-label={t('transaction.filters.dateTo')}
      />

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 gap-1">
          <X size={14} />
          {t('transaction.filters.clearFilters')}
        </Button>
      )}
    </div>
  );
}
