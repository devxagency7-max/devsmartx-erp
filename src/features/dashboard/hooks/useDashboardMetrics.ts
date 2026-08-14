import { useMemo } from 'react';
import { isThisMonth, parseISO, addDays } from 'date-fns';
import { useTransactions } from '@/features/finance/transactions/hooks/useTransactions';
import { useCommitments } from '@/features/finance/commitments/hooks/useCommitments';
import { usePaymentSources } from '@/features/finance/payment-sources/hooks/usePaymentSources';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';

export function useDashboardMetrics() {
  const { transactions, isLoading: txLoading } = useTransactions();
  const { data: commitmentsData = [], isLoading: cmLoading } = useCommitments();
  const { paymentSources, isLoading: psLoading } = usePaymentSources();

  const isLoading = txLoading || cmLoading || psLoading;

  const metrics = useMemo(() => {
    const completed = transactions.filter((t) => t.status === TransactionStatus.Completed);
    const thisMonth = completed.filter((t) => {
      try {
        return isThisMonth(parseISO(t.transactionDate));
      } catch {
        return false;
      }
    });

    const totalRevenue = thisMonth
      .filter((t) => t.type === TransactionType.Revenue)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = thisMonth
      .filter((t) => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.amount, 0);

    const netFlow = totalRevenue - totalExpenses;

    const pendingCount = transactions.filter(
      (t) => t.status === TransactionStatus.Pending,
    ).length;

    const today = new Date();
    const weekFromNow = addDays(today, 7);

    const upcomingCommitments = commitmentsData
      .filter((c) => {
        if (c.status !== 'Active') return false;
        try {
          return parseISO(c.nextDueDate) <= weekFromNow;
        } catch {
          return false;
        }
      })
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));

    const activeCommitmentsCount = commitmentsData.filter((c) => c.status === 'Active').length;

    const recentTransactions = [...transactions]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);

    return {
      totalRevenue,
      totalExpenses,
      netFlow,
      pendingCount,
      activeCommitmentsCount,
      upcomingCommitments,
      recentTransactions,
      paymentSourcesCount: paymentSources.length,
    };
  }, [transactions, commitmentsData, paymentSources]);

  return { ...metrics, isLoading };
}
