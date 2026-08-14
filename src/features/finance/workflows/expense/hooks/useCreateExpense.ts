import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransactionUseCase } from '@/features/finance/application/use-cases/impl';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { personService } from '@/features/finance/people/services/personService';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';
import { EXPENSES_QUERY_KEY } from './useExpenses';

export function useCreateExpense() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkflowFormData) => {
      const result = await createTransactionUseCase.execute({
        _type: 'CreateTransaction',
        type: TransactionType.Expense,
        paymentSourceId: data.paymentSourceId,
        amount: data.amount as number,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        categoryId: data.categoryId,
        description: data.description,
        notes: data.notes || undefined,
        transactionDate: data.transactionDate,
        actorId: 'current-user',
      });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      const tx = result.data;
      const contributions = data.partnerContributions ?? [];

      if (contributions.length > 0) {
        const totalAmount = data.amount as number;
        const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);

        await Promise.all(
          contributions.map((contribution) => {
            const partnerPaid = contribution.amount;
            const equalShare = Math.round((totalAmount / contributions.length) * 100) / 100;

            if (partnerPaid > equalShare) {
              // Partner paid more than their share → company owes partner (COMPANY_OWES_PERSON)
              const owedBack = Math.round((partnerPaid - equalShare) * 100) / 100;
              return personService.addLedgerEntry({
                personId: contribution.personId,
                direction: 'COMPANY_OWES_PERSON',
                amount: owedBack,
                currency: data.currency,
                reason: `مساهمة في مصروف: ${data.description}`,
                categoryId: data.categoryId || null,
                date: data.transactionDate,
                notes: `مصروف ${tx.referenceNumber} — دفع ${contribution.personName} ${partnerPaid} من أصل ${totalAmount}`,
              });
            } else if (partnerPaid < equalShare) {
              // Partner paid less than their share → partner owes company (PERSON_OWES_COMPANY)
              const owes = Math.round((equalShare - partnerPaid) * 100) / 100;
              return personService.addLedgerEntry({
                personId: contribution.personId,
                direction: 'PERSON_OWES_COMPANY',
                amount: owes,
                currency: data.currency,
                reason: `نصيب في مصروف: ${data.description}`,
                categoryId: data.categoryId || null,
                date: data.transactionDate,
                notes: `مصروف ${tx.referenceNumber} — نصيب ${contribution.personName} ${equalShare} دفع ${partnerPaid}`,
              });
            }
            // partnerPaid === equalShare → settled, no ledger entry needed
            return Promise.resolve();
          }),
        );

        // If total contributions < total expense → remaining was from company account (no ledger)
        void totalContributed;
      }

      return tx;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['people'] });
    },
  });
}
