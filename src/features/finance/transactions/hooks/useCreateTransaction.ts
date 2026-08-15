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

        // Total owed back to payers from unpaid partners' shares
        // Each unpaid partner's share gets split equally among payers
        const totalUnpaidShare = unpaidPartners.length * equalShare;
        const extraPerPayer = contributions.length > 0
          ? Math.round((totalUnpaidShare / contributions.length) * 100) / 100
          : 0;

        // Single entry per payer: (paid - equalShare) + share of unpaid partners
        const paidEntries = contributions.map((c) => {
          const overpaid = Math.round((c.amount - equalShare) * 100) / 100;
          // net = what they overpaid + what they're owed from unpaid partners
          const net = Math.round((overpaid + extraPerPayer) * 100) / 100;

          if (Math.abs(net) < 0.01) return Promise.resolve();

          return personService.addLedgerEntry({
            personId: c.personId,
            direction: net > 0 ? 'COMPANY_OWES_PERSON' : 'PERSON_OWES_COMPANY',
            amount: Math.abs(net),
            currency: input.currency,
            reason: net > 0
              ? `مساهمة زائدة في مصروف: ${input.description}`
              : `نصيب في مصروف: ${input.description}`,
            categoryId: input.categoryId || null,
            transactionId: record.id,
            date: input.transactionDate,
            notes: `مصروف ${record.referenceNumber} — دفع ${c.personName} ${c.amount}، نصيبه ${equalShare}، إضافي من غير الدافعين ${extraPerPayer}`,
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
