import { differenceInDays, parseISO, startOfToday } from 'date-fns';
import type { CommitmentDueWindow, CommitmentFrequency } from '../types/commitment.types';
import { DUE_SOON_DAYS } from '../types/commitment.types';

export function getDueWindow(nextDueDateIso: string, status: string): CommitmentDueWindow {
  if (status !== 'Active') return 'Upcoming';
  const today = startOfToday();
  const due = parseISO(nextDueDateIso);
  const diff = differenceInDays(due, today);
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'DueToday';
  if (diff <= DUE_SOON_DAYS) return 'DueSoon';
  return 'Upcoming';
}

/** Advance nextDueDate by one frequency interval */
export function advanceNextDueDate(current: string, frequency: CommitmentFrequency): string {
  const d = parseISO(current);
  switch (frequency) {
    case 'Weekly':     d.setDate(d.getDate() + 7); break;
    case 'Monthly':    d.setMonth(d.getMonth() + 1); break;
    case 'Quarterly':  d.setMonth(d.getMonth() + 3); break;
    case 'SemiAnnual': d.setMonth(d.getMonth() + 6); break;
    case 'Yearly':     d.setFullYear(d.getFullYear() + 1); break;
    case 'Custom':     d.setMonth(d.getMonth() + 1); break;
  }
  return d.toISOString().slice(0, 10);
}

export function generateCommitmentCode(): string {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `CMT-${datePart}-${rand}`;
}
