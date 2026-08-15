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
} from 'firebase/firestore';
import { db } from '@/core/firebase/firestore';

let categoryCache: Map<string, string> | null = null;
async function getCategoryName(id: string | null): Promise<string | null> {
  if (!id) return null;
  if (!categoryCache) {
    const snap = await getDocs(collection(db, 'categories'));
    categoryCache = new Map(snap.docs.map((d) => [d.id, (d.data() as any).name as string]));
  }
  return categoryCache.get(id) ?? null;
}
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { generateReference } from '../utils/generateReference';
import type {
  TransactionRecord,
  TransactionFormInput,
  TransactionFilters,
} from '../types/transaction.types';

const COL = 'transactions';

function now(): string {
  return new Date().toISOString();
}

function docToRecord(id: string, data: Record<string, unknown>): TransactionRecord {
  return {
    id,
    referenceNumber: data.referenceNumber as string,
    type: data.type as TransactionType,
    status: data.status as TransactionStatus,
    paymentSourceId: data.paymentSourceId as string,
    paymentSourceName: data.paymentSourceName as string,
    destinationPaymentSourceId: (data.destinationPaymentSourceId as string) ?? null,
    destinationPaymentSourceName: (data.destinationPaymentSourceName as string) ?? null,
    partnerId: (data.partnerId as string) ?? null,
    partnerName: (data.partnerName as string) ?? null,
    originalTransactionId: (data.originalTransactionId as string) ?? null,
    originalTransactionRef: (data.originalTransactionRef as string) ?? null,
    amount: data.amount as number,
    currency: data.currency as TransactionRecord['currency'],
    paymentMethod: data.paymentMethod as PaymentMethod,
    categoryId: (data.categoryId as string) ?? null,
    categoryName: (data.categoryName as string) ?? null,
    description: (data.description as string) ?? '',
    notes: (data.notes as string) ?? '',
    attachments: (data.attachments as TransactionRecord['attachments']) ?? [],
    partnerContributions: (data.partnerContributions as TransactionRecord['partnerContributions']) ?? [],
    allPartners: (data.allPartners as TransactionRecord['allPartners']) ?? [],
    transactionDate: data.transactionDate as string,
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
    createdBy: (data.createdBy as string) ?? '',
    approvedBy: (data.approvedBy as string) ?? null,
  };
}

function applyFilters(
  list: TransactionRecord[],
  filters: Partial<TransactionFilters>,
): TransactionRecord[] {
  return list.filter((t) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !t.referenceNumber.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q) &&
        !t.paymentSourceName.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.type && t.type !== filters.type) return false;
    if (filters.paymentSourceId && t.paymentSourceId !== filters.paymentSourceId) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.currency && t.currency !== filters.currency) return false;
    if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false;
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
    if (filters.dateFrom && t.transactionDate < filters.dateFrom) return false;
    if (filters.dateTo && t.transactionDate > filters.dateTo) return false;
    if (filters.amountMin && t.amount < Number(filters.amountMin)) return false;
    if (filters.amountMax && t.amount > Number(filters.amountMax)) return false;
    return true;
  });
}

export const transactionService = {
  async getAll(filters?: Partial<TransactionFilters>): Promise<TransactionRecord[]> {
    const q = query(collection(db, COL), orderBy('transactionDate', 'desc'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    // Backfill categoryName for old records that have categoryId but no categoryName
    await Promise.all(
      list.map(async (t) => {
        if (t.categoryId && !t.categoryName) {
          t.categoryName = await getCategoryName(t.categoryId);
        }
      }),
    );
    return filters ? applyFilters(list, filters) : list;
  },

  async getById(id: string): Promise<TransactionRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async create(
    input: TransactionFormInput,
    createdBy: string,
    paymentSourceName: string,
    destinationPaymentSourceName?: string,
  ): Promise<TransactionRecord> {
    const data = {
      referenceNumber: generateReference(input.type),
      type: input.type,
      status: TransactionStatus.Pending,
      paymentSourceId: input.paymentSourceId,
      paymentSourceName,
      destinationPaymentSourceId: input.destinationPaymentSourceId || null,
      destinationPaymentSourceName: destinationPaymentSourceName ?? null,
      partnerId: input.partnerId || null,
      partnerName: null,
      originalTransactionId: input.originalTransactionId || null,
      originalTransactionRef: null,
      amount: input.amount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      categoryId: input.categoryId || null,
      categoryName: input.categoryName || null,
      description: input.description,
      notes: input.notes,
      attachments: (input.attachments ?? []).map((a) => ({
        id: a.publicId,
        fileName: a.fileName,
        fileUrl: a.url,
        mimeType: a.mimeType ?? '',
      })),
      allPartners: (input.allPartners ?? []),
      partnerContributions: (() => {
        const contribs = input.partnerContributions ?? [];
        const totalPartners = (input.allPartners ?? []).length || contribs.length;
        const equalShare = totalPartners > 0
          ? Math.round((input.amount / totalPartners) * 100) / 100
          : 0;
        return contribs.map((c) => ({
          personId: c.personId,
          personName: c.personName,
          amount: c.amount,
          equalShare,
        }));
      })(),
      transactionDate: input.transactionDate,
      createdAt: now(),
      updatedAt: now(),
      createdBy,
      approvedBy: null,
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data } as TransactionRecord;
  },

  async update(id: string, input: Partial<TransactionFormInput>): Promise<TransactionRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('transaction.errors.notFound');

    const existing = docToRecord(id, snap.data() as Record<string, unknown>);
    if (
      existing.status === TransactionStatus.Completed ||
      existing.status === TransactionStatus.Cancelled ||
      existing.status === TransactionStatus.Rejected
    ) {
      throw new Error('transaction.errors.immutable');
    }

    const updates: Partial<Record<string, unknown>> = { updatedAt: now() };
    if (input.amount !== undefined) updates.amount = input.amount;
    if (input.paymentSourceId) updates.paymentSourceId = input.paymentSourceId;
    if (input.destinationPaymentSourceId !== undefined)
      updates.destinationPaymentSourceId = input.destinationPaymentSourceId || null;
    if (input.paymentMethod) updates.paymentMethod = input.paymentMethod;
    if (input.categoryId !== undefined) updates.categoryId = input.categoryId || null;
    if (input.categoryName !== undefined) updates.categoryName = input.categoryName || null;
    if (input.description) updates.description = input.description;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.transactionDate) updates.transactionDate = input.transactionDate;
    if (input.allPartners !== undefined) updates.allPartners = input.allPartners;
    if (input.partnerContributions !== undefined) updates.partnerContributions = input.partnerContributions;

    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async cancel(id: string): Promise<TransactionRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('transaction.errors.notFound');
    const existing = docToRecord(id, snap.data() as Record<string, unknown>);
    if (existing.status === TransactionStatus.Completed) {
      throw new Error('transaction.errors.cannotCancelCompleted');
    }
    const updates = { status: TransactionStatus.Cancelled, updatedAt: now() };
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async createFromRecord(record: TransactionRecord): Promise<TransactionRecord> {
    const { id, ...data } = record;
    const ref = await addDoc(collection(db, COL), data);
    return { ...record, id: ref.id };
  },

  async updateRecord(record: TransactionRecord): Promise<TransactionRecord> {
    const ref = doc(db, COL, record.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('transaction.errors.notFound');
    const { id, ...data } = record;
    await updateDoc(ref, data as Record<string, unknown>);
    return record;
  },

  async updateStatus(
    id: string,
    status: TransactionStatus,
    approvedBy?: string,
  ): Promise<TransactionRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('transaction.errors.notFound');
    const updates: Record<string, unknown> = { status, updatedAt: now() };
    if (approvedBy !== undefined) updates.approvedBy = approvedBy;
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async duplicate(id: string, createdBy: string): Promise<TransactionRecord> {
    const original = await transactionService.getById(id);
    if (!original) throw new Error('transaction.errors.notFound');
    const data = {
      ...original,
      referenceNumber: generateReference(original.type),
      status: TransactionStatus.Draft,
      transactionDate: new Date().toISOString().slice(0, 10),
      createdAt: now(),
      updatedAt: now(),
      createdBy,
      approvedBy: null,
    };
    const { id: _oldId, ...rest } = data;
    const ref = await addDoc(collection(db, COL), rest);
    return { ...data, id: ref.id };
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },
};
