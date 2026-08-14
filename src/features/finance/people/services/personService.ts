import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '@/core/firebase/firestore';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { generateReference } from '@/features/finance/transactions/utils/generateReference';
import { paymentSourceService } from '@/features/finance/payment-sources/services/paymentSourceService';
import { categoryService } from '@/features/finance/master-data/categories/services/categoryService';
import type { TransactionRecord } from '@/features/finance/transactions/types/transaction.types';
import type { CurrencyCode } from '@/shared/types/currency';
import type {
  PersonRecord,
  PersonLedgerEntry,
  CreatePersonInput,
  CreateLedgerEntryInput,
  CreateSettlementInput,
  PersonFilters,
} from '../types/person.types';
import { generatePersonCode, generateLedgerRef, derivePersonBalances } from '../utils/personHelpers';

const COL = 'persons';
const LEDGER_COL = 'personLedger';
const now = () => new Date().toISOString();

function docToRecord(id: string, data: Record<string, unknown>): PersonRecord {
  return {
    id,
    code: data.code as string,
    name: data.name as string,
    email: (data.email as string) ?? null,
    phone: (data.phone as string) ?? null,
    type: data.type as PersonRecord['type'],
    status: data.status as PersonRecord['status'],
    notes: (data.notes as string) ?? '',
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

function ledgerDocToRecord(id: string, data: Record<string, unknown>): PersonLedgerEntry {
  return {
    id,
    personId: data.personId as string,
    direction: data.direction as PersonLedgerEntry['direction'],
    amount: data.amount as number,
    currency: data.currency as string,
    reason: data.reason as string,
    categoryId: (data.categoryId as string) ?? null,
    transactionId: (data.transactionId as string) ?? null,
    relatedProjectId: (data.relatedProjectId as string) ?? null,
    reference: data.reference as string,
    date: data.date as string,
    status: data.status as PersonLedgerEntry['status'],
    notes: (data.notes as string) ?? '',
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

function applyFilters(list: PersonRecord[], filters: Partial<PersonFilters>): PersonRecord[] {
  return list.filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !(p.email ?? '').toLowerCase().includes(q) &&
        !p.code.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.type && p.type !== filters.type) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });
}

export const personService = {
  async getAll(filters?: Partial<PersonFilters>): Promise<PersonRecord[]> {
    const q = query(collection(db, COL), orderBy('name'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    return filters ? applyFilters(list, filters) : list;
  },

  async getById(id: string): Promise<PersonRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async create(input: CreatePersonInput): Promise<PersonRecord> {
    const data = {
      code: generatePersonCode(),
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      type: input.type,
      status: 'Active' as const,
      notes: input.notes ?? '',
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data };
  },

  async update(id: string, input: Partial<CreatePersonInput>): Promise<PersonRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('person.errors.notFound');
    const updates = { ...input, updatedAt: now() };
    await updateDoc(ref, updates as Record<string, unknown>);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async setStatus(id: string, status: PersonRecord['status']): Promise<PersonRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('person.errors.notFound');
    const updates = { status, updatedAt: now() };
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async delete(id: string): Promise<void> {
    const ref = doc(db, COL, id);
    if (!(await getDoc(ref)).exists()) throw new Error('person.errors.notFound');
    await deleteDoc(ref);
  },

  async getLedgerEntries(personId: string): Promise<PersonLedgerEntry[]> {
    const q = query(
      collection(db, LEDGER_COL),
      where('personId', '==', personId),
      orderBy('date', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ledgerDocToRecord(d.id, d.data() as Record<string, unknown>));
  },

  async getLedgerBalances(personId: string) {
    const entries = await personService.getLedgerEntries(personId);
    return derivePersonBalances(entries);
  },

  async addLedgerEntry(input: CreateLedgerEntryInput): Promise<PersonLedgerEntry> {
    const data = {
      personId: input.personId,
      direction: input.direction,
      amount: input.amount,
      currency: input.currency,
      reason: input.reason,
      categoryId: input.categoryId ?? null,
      transactionId: null,
      relatedProjectId: input.relatedProjectId ?? null,
      reference: generateLedgerRef(),
      date: input.date,
      status: 'Pending' as const,
      notes: input.notes ?? '',
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, LEDGER_COL), data);
    return { id: ref.id, ...data };
  },

  async createSettlement(input: CreateSettlementInput): Promise<{
    ledgerEntry: PersonLedgerEntry;
    transaction: TransactionRecord;
  }> {
    const person = await personService.getById(input.personId);
    if (!person) throw new Error('person.errors.notFound');

    const source = await paymentSourceService.getById(input.paymentSourceId);
    if (!source) throw new Error('person.errors.paymentSourceNotFound');

    const category = await categoryService.getById(input.categoryId);

    const txnType =
      input.settlementDirection === 'PERSON_OWES_COMPANY'
        ? TransactionType.Revenue
        : TransactionType.Expense;

    const txnData = {
      referenceNumber: generateReference(txnType),
      type: txnType,
      status: TransactionStatus.Completed,
      paymentSourceId: input.paymentSourceId,
      paymentSourceName: source.name,
      destinationPaymentSourceId: null,
      destinationPaymentSourceName: null,
      partnerId: null,
      partnerName: person.name,
      originalTransactionId: null,
      originalTransactionRef: null,
      amount: input.amount,
      currency: input.currency as CurrencyCode,
      paymentMethod: input.paymentMethodId as PaymentMethod,
      categoryId: input.categoryId,
      categoryName: category?.name ?? null,
      description: `Settlement: ${person.name}`,
      notes: input.notes ?? '',
      attachments: [],
      transactionDate: input.settledAt,
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'system',
      approvedBy: null,
    };
    const txnRef = await addDoc(collection(db, 'transactions'), txnData);
    const transaction: TransactionRecord = { id: txnRef.id, ...txnData };

    const entryData = {
      personId: input.personId,
      direction: input.settlementDirection,
      amount: input.amount,
      currency: input.currency,
      reason: `Settlement — ${txnData.referenceNumber}`,
      categoryId: input.categoryId,
      transactionId: txnRef.id,
      relatedProjectId: null,
      reference: generateLedgerRef(),
      date: input.settledAt,
      status: 'Settled' as const,
      notes: input.notes ?? '',
      createdAt: now(),
      updatedAt: now(),
    };
    const entryRef = await addDoc(collection(db, LEDGER_COL), entryData);
    const ledgerEntry: PersonLedgerEntry = { id: entryRef.id, ...entryData };

    return { ledgerEntry, transaction };
  },
};
