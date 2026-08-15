import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/core/firebase/firestore';
import { transactionService } from './transactionService';
import { personService } from '@/features/finance/people/services/personService';

/**
 * One-time migration: reads all expense transactions that have partnerContributions
 * and allPartners, then writes ledger entries for any partner that doesn't already
 * have a ledger entry linked to that transaction.
 */
export async function migrateLedgerEntriesFromTransactions(): Promise<{
  processed: number;
  written: number;
  skipped: number;
}> {
  const transactions = await transactionService.getAll();
  const expensesWithContribs = transactions.filter(
    (tx) => tx.partnerContributions && tx.partnerContributions.length > 0,
  );

  let written = 0;
  let skipped = 0;

  for (const tx of expensesWithContribs) {
    const contribs = tx.partnerContributions ?? [];
    const allPartners = tx.allPartners ?? [];
    const totalPartners = allPartners.length || contribs.length;
    if (totalPartners === 0) continue;

    const equalShare = contribs[0]?.equalShare
      ?? Math.round((tx.amount / totalPartners) * 100) / 100;

    // Check existing ledger entries for this transaction
    const existingSnap = await getDocs(
      query(collection(db, 'personLedger'), where('transactionId', '==', tx.id)),
    );
    const existingPersonIds = new Set(
      existingSnap.docs.map((d) => d.data().personId as string),
    );

    // Partners who paid something
    for (const c of contribs) {
      if (existingPersonIds.has(c.personId)) { skipped++; continue; }
      const diff = Math.round((c.amount - equalShare) * 100) / 100;
      if (Math.abs(diff) < 0.01) { skipped++; continue; } // settled — no entry needed

      await personService.addLedgerEntry({
        personId: c.personId,
        direction: diff < 0 ? 'PERSON_OWES_COMPANY' : 'COMPANY_OWES_PERSON',
        amount: Math.abs(diff),
        currency: tx.currency,
        reason: diff < 0
          ? `نصيب في مصروف: ${tx.description}`
          : `مساهمة في مصروف: ${tx.description}`,
        transactionId: tx.id,
        date: tx.transactionDate,
        notes: `مصروف ${tx.referenceNumber} — دفع ${c.personName} ${c.amount}، نصيبه ${equalShare}`,
      });
      written++;
    }

    // Partners who paid nothing (in allPartners but not in contributions)
    const paidIds = new Set(contribs.map((c) => c.personId));
    for (const p of allPartners) {
      if (paidIds.has(p.personId)) continue;
      if (existingPersonIds.has(p.personId)) { skipped++; continue; }

      await personService.addLedgerEntry({
        personId: p.personId,
        direction: 'PERSON_OWES_COMPANY',
        amount: equalShare,
        currency: tx.currency,
        reason: `نصيب في مصروف: ${tx.description}`,
        transactionId: tx.id,
        date: tx.transactionDate,
        notes: `مصروف ${tx.referenceNumber} — نصيب ${p.personName} ${equalShare} — لم يدفع شيئاً`,
      });
      written++;
    }
  }

  return { processed: expensesWithContribs.length, written, skipped };
}
