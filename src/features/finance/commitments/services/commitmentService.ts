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
  RecurringCommitmentRecord,
  CommitmentPaymentRecord,
  CreateCommitmentInput,
  RecordCommitmentPaymentInput,
  CommitmentFilters,
} from '../types/commitment.types';
import { generateCommitmentCode, advanceNextDueDate } from '../utils/commitmentHelpers';

const COL = 'commitments';
const PAYMENTS_COL = 'commitmentPayments';
const now = () => new Date().toISOString();

function docToRecord(id: string, data: Record<string, unknown>): RecurringCommitmentRecord {
  return {
    id,
    code: data.code as string,
    name: data.name as string,
    description: (data.description as string) ?? '',
    categoryId: (data.categoryId as string) ?? null,
    categoryName: (data.categoryName as string) ?? null,
    defaultPaymentSourceId: (data.defaultPaymentSourceId as string) ?? null,
    defaultPaymentSourceName: (data.defaultPaymentSourceName as string) ?? null,
    defaultPaymentMethodId: (data.defaultPaymentMethodId as string) ?? null,
    amount: data.amount as number,
    currency: data.currency as string,
    frequency: data.frequency as RecurringCommitmentRecord['frequency'],
    startDate: data.startDate as string,
    nextDueDate: data.nextDueDate as string,
    endDate: (data.endDate as string) ?? null,
    status: data.status as RecurringCommitmentRecord['status'],
    vendorName: (data.vendorName as string) ?? '',
    relatedProjectId: (data.relatedProjectId as string) ?? null,
    notes: (data.notes as string) ?? '',
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

function paymentDocToRecord(id: string, data: Record<string, unknown>): CommitmentPaymentRecord {
  return {
    id,
    commitmentId: data.commitmentId as string,
    transactionId: data.transactionId as string,
    amount: data.amount as number,
    currency: data.currency as string,
    paidAt: data.paidAt as string,
    status: data.status as CommitmentPaymentRecord['status'],
    notes: (data.notes as string) ?? '',
  };
}

function applyFilters(
  list: RecurringCommitmentRecord[],
  filters: Partial<CommitmentFilters>,
): RecurringCommitmentRecord[] {
  return list.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.code.toLowerCase().includes(q) &&
        !c.vendorName.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.status && c.status !== filters.status) return false;
    if (filters.frequency && c.frequency !== filters.frequency) return false;
    if (filters.currency && c.currency !== filters.currency) return false;
    return true;
  });
}

export const commitmentService = {
  async getAll(filters?: Partial<CommitmentFilters>): Promise<RecurringCommitmentRecord[]> {
    const q = query(collection(db, COL), orderBy('nextDueDate'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    return filters ? applyFilters(list, filters) : list;
  },

  async getById(id: string): Promise<RecurringCommitmentRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async create(input: CreateCommitmentInput): Promise<RecurringCommitmentRecord> {
    let categoryName: string | null = null;
    if (input.categoryId) {
      const cat = await categoryService.getById(input.categoryId);
      categoryName = cat?.name ?? null;
    }
    let paymentSourceName: string | null = null;
    if (input.defaultPaymentSourceId) {
      const source = await paymentSourceService.getById(input.defaultPaymentSourceId);
      paymentSourceName = source?.name ?? null;
    }
    const data = {
      code: generateCommitmentCode(),
      name: input.name,
      description: input.description ?? '',
      categoryId: input.categoryId ?? null,
      categoryName,
      defaultPaymentSourceId: input.defaultPaymentSourceId ?? null,
      defaultPaymentSourceName: paymentSourceName,
      defaultPaymentMethodId: input.defaultPaymentMethodId ?? null,
      amount: input.amount,
      currency: input.currency,
      frequency: input.frequency,
      startDate: input.startDate,
      nextDueDate: input.startDate,
      endDate: input.endDate ?? null,
      status: 'Active' as const,
      vendorName: input.vendorName ?? '',
      relatedProjectId: input.relatedProjectId ?? null,
      notes: input.notes ?? '',
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data };
  },

  async update(
    id: string,
    input: Partial<CreateCommitmentInput>,
  ): Promise<RecurringCommitmentRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('commitment.errors.notFound');
    const existing = docToRecord(id, snap.data() as Record<string, unknown>);

    let categoryName = existing.categoryName;
    if (input.categoryId !== undefined) {
      categoryName = input.categoryId
        ? ((await categoryService.getById(input.categoryId))?.name ?? null)
        : null;
    }
    let paymentSourceName = existing.defaultPaymentSourceName;
    if (input.defaultPaymentSourceId !== undefined) {
      paymentSourceName = input.defaultPaymentSourceId
        ? ((await paymentSourceService.getById(input.defaultPaymentSourceId))?.name ?? null)
        : null;
    }

    const updates = {
      ...input,
      categoryName,
      defaultPaymentSourceName: paymentSourceName,
      updatedAt: now(),
    };
    await updateDoc(ref, updates as Record<string, unknown>);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async setStatus(
    id: string,
    status: RecurringCommitmentRecord['status'],
  ): Promise<RecurringCommitmentRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('commitment.errors.notFound');
    const updates = { status, updatedAt: now() };
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async delete(id: string): Promise<void> {
    const ref = doc(db, COL, id);
    if (!(await getDoc(ref)).exists()) throw new Error('commitment.errors.notFound');
    await deleteDoc(ref);
  },

  async getPayments(commitmentId: string): Promise<CommitmentPaymentRecord[]> {
    const q = query(
      collection(db, PAYMENTS_COL),
      where('commitmentId', '==', commitmentId),
      orderBy('paidAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => paymentDocToRecord(d.id, d.data() as Record<string, unknown>));
  },

  async markPaid(input: RecordCommitmentPaymentInput): Promise<{
    payment: CommitmentPaymentRecord;
    transaction: TransactionRecord;
  }> {
    const commitment = await commitmentService.getById(input.commitmentId);
    if (!commitment) throw new Error('commitment.errors.notFound');

    const source = await paymentSourceService.getById(input.paymentSourceId);
    if (!source) throw new Error('commitment.errors.paymentSourceNotFound');

    const category = await categoryService.getById(input.categoryId);

    const txnData = {
      referenceNumber: generateReference(TransactionType.Expense),
      type: TransactionType.Expense,
      status: TransactionStatus.Completed,
      paymentSourceId: input.paymentSourceId,
      paymentSourceName: source.name,
      destinationPaymentSourceId: null,
      destinationPaymentSourceName: null,
      partnerId: null,
      partnerName: commitment.vendorName || null,
      originalTransactionId: null,
      originalTransactionRef: null,
      amount: input.amount,
      currency: input.currency as CurrencyCode,
      paymentMethod: input.paymentMethodId as PaymentMethod,
      categoryId: input.categoryId,
      categoryName: category?.name ?? null,
      description: `Commitment payment: ${commitment.name}`,
      notes: input.notes ?? '',
      attachments: [],
      transactionDate: input.paidAt,
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'system',
      approvedBy: null,
    };
    const txnRef = await addDoc(collection(db, 'transactions'), txnData);
    const txnRecord: TransactionRecord = { id: txnRef.id, ...txnData };

    let paymentStatus: CommitmentPaymentRecord['status'] = 'Paid';
    if (input.amount < commitment.amount) paymentStatus = 'Partial';
    else if (input.amount > commitment.amount) paymentStatus = 'Overpaid';

    const paymentData = {
      commitmentId: input.commitmentId,
      transactionId: txnRef.id,
      amount: input.amount,
      currency: input.currency,
      paidAt: input.paidAt,
      status: paymentStatus,
      notes: input.notes ?? '',
    };
    const payRef = await addDoc(collection(db, PAYMENTS_COL), paymentData);
    const payment: CommitmentPaymentRecord = { id: payRef.id, ...paymentData };

    const newNextDue = advanceNextDueDate(commitment.nextDueDate, commitment.frequency);
    const expired = commitment.endDate && newNextDue > commitment.endDate;
    await updateDoc(doc(db, COL, input.commitmentId), {
      nextDueDate: newNextDue,
      status: expired ? 'Expired' : commitment.status,
      updatedAt: now(),
    });

    return { payment, transaction: txnRecord };
  },
};
