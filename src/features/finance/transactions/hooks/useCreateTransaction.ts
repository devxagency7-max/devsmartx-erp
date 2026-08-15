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
      const allPartners = input.allPartners ?? [];
      if (contributions.length > 0 && input.type === TransactionType.Expense) {
        const totalPartners = allPartners.length || contributions.length;
        const equalShare = Math.round((input.amount / totalPartners) * 100) / 100;

        const paidIds = new Set(contributions.map((c) => c.personId));
        const unpaidPartners = allPartners.filter((p) => !paidIds.has(p.personId));

        const totalUnpaidShare = unpaidPartners.length * equalShare;
        // Only partners who paid >= their share can claim a portion of unpaid shares
        const fullPayers = contributions.filter((c) => c.amount >= equalShare - 0.01);
        const extraPerFullPayer = fullPayers.length > 0
          ? Math.round((totalUnpaidShare / fullPayers.length) * 100) / 100
          : 0;

        const paidEntries = contributions.map((c) => {
          const paidFull = c.amount >= equalShare - 0.01;
          let net: number;
          let direction: 'COMPANY_OWES_PERSON' | 'PERSON_OWES_COMPANY';
          let reason: string;

          if (paidFull) {
            const overpaid = Math.round((c.amount - equalShare) * 100) / 100;
            net = Math.round((overpaid + extraPerFullPayer) * 100) / 100;
            direction = 'COMPANY_OWES_PERSON';
            reason = `مساهمة زائدة في مصروف: ${input.description}`;
          } else {
            net = Math.round((equalShare - c.amount) * 100) / 100;
            direction = 'PERSON_OWES_COMPANY';
            reason = `نصيب في مصروف: ${input.description}`;
          }

          if (Math.abs(net) < 0.01) return Promise.resolve();

          return personService.addLedgerEntry({
            personId: c.personId,
            direction,
            amount: Math.abs(net),
            currency: input.currency,
            reason,
            categoryId: input.categoryId || null,
            transactionId: record.id,
            date: input.transactionDate,
            notes: `مصروف ${record.referenceNumber} — دفع ${c.personName} ${c.amount}، نصيبه ${equalShare}`,
          });
        });

        // Entry per unpaid partner: owes full equal share
        const unpaidEntries = unpaidPartners.map((p) =>
          personService.addLedgerEntry({
            personId: p.personId,
            direction: 'PERSON_OWES_COMPANY',
            amount: equalShare,
            currency: input.currency,
            reason: `نصيب في مصروف: ${input.description}`,
            categoryId: input.categoryId || null,
            transactionId: record.id,
            date: input.transactionDate,
            notes: `مصروف ${record.referenceNumber} — نصيب ${p.personName} ${equalShare} — لم يدفع شيئاً`,
          }),
        );

        await Promise.all([...paidEntries, ...unpaidEntries]);
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
