import type { PersonLedgerEntry, PersonBalance, LedgerDirection } from '../types/person.types';

/** Generates a reference number: PRS-YYYYMMDD-XXXXX */
export function generatePersonCode(): string {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PRS-${datePart}-${rand}`;
}

/** Generates a ledger entry reference: PLE-YYYYMMDD-XXXXX */
export function generateLedgerRef(): string {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PLE-${datePart}-${rand}`;
}

/**
 * Derives person balances per currency from ledger entries.
 * Positive net = person owes company. Negative net = company owes person.
 * Multi-currency: never combined.
 */
export function derivePersonBalances(entries: PersonLedgerEntry[]): PersonBalance[] {
  const active = entries.filter((e) => e.status !== 'Cancelled');
  const byCurrency = new Map<string, number>();

  for (const entry of active) {
    const current = byCurrency.get(entry.currency) ?? 0;
    if (entry.direction === 'PERSON_OWES_COMPANY') {
      byCurrency.set(entry.currency, current + entry.amount);
    } else {
      byCurrency.set(entry.currency, current - entry.amount);
    }
  }

  return Array.from(byCurrency.entries()).map(([currency, net]) => {
    let direction: LedgerDirection | 'Settled';
    if (net > 0) direction = 'PERSON_OWES_COMPANY';
    else if (net < 0) direction = 'COMPANY_OWES_PERSON';
    else direction = 'Settled';
    return { currency, netAmount: Math.abs(net), direction };
  });
}
