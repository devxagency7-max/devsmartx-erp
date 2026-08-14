import { useMemo } from 'react';
import { useTransactions } from '@/features/finance/transactions/hooks/useTransactions';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import type { CurrencyCode } from '@/shared/types/currency';

export interface PaymentSourceSummary {
  id: string;
  name: string;
  type: string;
  currency: CurrencyCode;
  txCount: number;
  totalIn: number;
  totalOut: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  total: number;
  currency: CurrencyCode;
}

export function useFinanceOverview() {
  const { transactions, isLoading: txLoading } = useTransactions();
  const { paymentSources, isLoading: psLoading } = usePaymentSources();

  const isLoading = txLoading || psLoading;

  const data = useMemo(() => {
    const completed = transactions.filter((t) => t.status === TransactionStatus.Completed);

    const allTimeRevenue = completed
      .filter((t) => t.type === TransactionType.Revenue)
      .reduce((s, t) => s + t.amount, 0);

    const allTimeExpenses = completed
      .filter((t) => t.type === TransactionType.Expense)
      .reduce((s, t) => s + t.amount, 0);

    const allTimeNet = allTimeRevenue - allTimeExpenses;

    // Group by payment source
    const sourceMap = new Map<string, PaymentSourceSummary>();
    for (const ps of paymentSources) {
      sourceMap.set(ps.id, {
        id: ps.id,
        name: ps.name,
        type: ps.type,
        currency: ps.currency as CurrencyCode,
        txCount: 0,
        totalIn: 0,
        totalOut: 0,
      });
    }

    for (const tx of completed) {
      if (sourceMap.has(tx.paymentSourceId)) {
        const entry = sourceMap.get(tx.paymentSourceId)!;
        entry.txCount += 1;
        if (tx.type === TransactionType.Revenue) {
          entry.totalIn += tx.amount;
        } else if (tx.type === TransactionType.Expense) {
          entry.totalOut += tx.amount;
        }
      }
    }

    const sourcesSummary = [...sourceMap.values()].sort(
      (a, b) => b.txCount - a.txCount,
    );

    // Top categories by expense total
    const categoryMap = new Map<string, CategorySummary>();
    for (const tx of completed) {
      if (tx.type !== TransactionType.Expense) continue;
      if (!tx.categoryId || !tx.categoryName) continue;
      const existing = categoryMap.get(tx.categoryId);
      if (existing) {
        existing.total += tx.amount;
      } else {
        categoryMap.set(tx.categoryId, {
          id: tx.categoryId,
          name: tx.categoryName,
          total: tx.amount,
          currency: tx.currency,
        });
      }
    }

    const topCategories = [...categoryMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const maxCategoryTotal = topCategories[0]?.total ?? 1;

    return {
      allTimeRevenue,
      allTimeExpenses,
      allTimeNet,
      sourcesSummary,
      topCategories,
      maxCategoryTotal,
    };
  }, [transactions, paymentSources]);

  return { ...data, isLoading };
}
