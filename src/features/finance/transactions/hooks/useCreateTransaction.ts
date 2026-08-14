import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { paymentSourceService } from '@/features/finance/payment-sources/services/paymentSourceService';
import { personService } from '@/features/finance/people/services/personService';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TRANSACTIONS_QUERY_KEY } from './useTransactions';
import type { TransactionFormInput, TransactionRecord } from '../types/transaction.types';

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createTransaction(
    input: TransactionFormInput,
  ): Promise<TransactionRecord | null> {
    setIsLoading(true);
    setError(null);
    try {
      const source = await paymentSourceService.getById(input.paymentSourceId);
      const destSource = input.destinationPaymentSourceId
        ? await paymentSourceService.getById(input.destinationPaymentSourceId)
        : null;

      const record = await transactionService.create(
        input,
        'current-user',
        source?.name ?? '',
        destSource?.name ?? undefined,
      );

      const contributions = input.partnerContributions ?? [];
      if (contributions.length > 0 && input.type === TransactionType.Expense) {
        await Promise.all(
          contributions.map((contribution) => {
            const partnerPaid = contribution.amount;
            const equalShare =
              Math.round((input.amount / contributions.length) * 100) / 100;

            if (partnerPaid > equalShare) {
              const owedBack = Math.round((partnerPaid - equalShare) * 100) / 100;
              return personService.addLedgerEntry({
                personId: contribution.personId,
                direction: 'COMPANY_OWES_PERSON',
                amount: owedBack,
                currency: input.currency,
                reason: `مساهمة في مصروف: ${input.description}`,
                categoryId: input.categoryId || null,
                date: input.transactionDate,
                notes: `مصروف ${record.referenceNumber} — دفع ${contribution.personName} ${partnerPaid} من أصل ${input.amount}`,
              });
            } else if (partnerPaid < equalShare) {
              const owes = Math.round((equalShare - partnerPaid) * 100) / 100;
              return personService.addLedgerEntry({
                personId: contribution.personId,
                direction: 'PERSON_OWES_COMPANY',
                amount: owes,
                currency: input.currency,
                reason: `نصيب في مصروف: ${input.description}`,
                categoryId: input.categoryId || null,
                date: input.transactionDate,
                notes: `مصروف ${record.referenceNumber} — نصيب ${contribution.personName} ${equalShare} دفع ${partnerPaid}`,
              });
            }
            return Promise.resolve();
          }),
        );
        await queryClient.invalidateQueries({ queryKey: ['people'] });
      }

      await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      return record;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'transaction.errors.createFailed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { createTransaction, isLoading, error, clearError: () => setError(null) };
}
