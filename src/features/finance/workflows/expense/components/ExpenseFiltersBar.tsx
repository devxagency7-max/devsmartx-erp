import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { useExpenseStore } from '../store/expenseStore';
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';

export function ExpenseFiltersBar() {
  const { t } = useTranslation();
  const { filters, setFilters, resetFilters } = useExpenseStore();
  const { data: categories = [] } = useCategories();
  const { paymentSources } = usePaymentSources();

  const expenseCategories = categories.filter((c) =>
    c.applicableTypes.includes(TransactionType.Expense),
  );

  const hasActive = Object.values(filters).some((v) => v !== '');

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input
        placeholder={t('expense.filters.searchPlaceholder')}
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="w-56"
      />

      <Select value={filters.categoryId || '__all'} onValueChange={(v) => setFilters({ categoryId: v === '__all' ? '' : v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t('expense.filters.categoryAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{t('expense.filters.categoryAll')}</SelectItem>
          {expenseCategories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.paymentSourceId || '__all'} onValueChange={(v) => setFilters({ paymentSourceId: v === '__all' ? '' : v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t('expense.filters.paymentSourceAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{t('expense.filters.paymentSourceAll')}</SelectItem>
          {paymentSources.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status || '__all'} onValueChange={(v) => setFilters({ status: v === '__all' ? '' : v })}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={t('transaction.filters.statusAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{t('transaction.filters.statusAll')}</SelectItem>
          {Object.values(TransactionStatus).map((s) => (
            <SelectItem key={s} value={s}>{t(`transaction.status_${s}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.paymentMethod || '__all'} onValueChange={(v) => setFilters({ paymentMethod: v === '__all' ? '' : v })}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={t('transaction.filters.paymentMethodAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{t('transaction.filters.paymentMethodAll')}</SelectItem>
          {Object.values(PaymentMethod).map((pm) => (
            <SelectItem key={pm} value={pm}>{t(`transaction.pm_${pm}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          {t('transaction.filters.clearFilters')}
        </Button>
      )}
    </div>
  );
}
