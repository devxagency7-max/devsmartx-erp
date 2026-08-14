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
import type { CurrencyCode } from '@/shared/types/currency';
import {
  PaymentSourceType,
  type PaymentSourceRecord,
  type PaymentSourceFilters,
  type CreatePaymentSourceInput,
  type EditPaymentSourceInput,
} from '../types/paymentSource.types';

const COL = 'paymentSources';

function now(): string {
  return new Date().toISOString();
}

function generateCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `PS-${date}-${seq}`;
}

function docToRecord(id: string, data: Record<string, unknown>): PaymentSourceRecord {
  return {
    id,
    code: data.code as string,
    name: data.name as string,
    type: data.type as PaymentSourceType,
    currency: data.currency as CurrencyCode,
    status: data.status as PaymentSourceRecord['status'],
    description: (data.description as string) ?? '',
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

function applyFilters(
  list: PaymentSourceRecord[],
  filters: Partial<PaymentSourceFilters>,
): PaymentSourceRecord[] {
  return list.filter((s) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.code.toLowerCase().includes(q) &&
        !(s.description ?? '').toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.type && s.type !== filters.type) return false;
    if (filters.currency && s.currency !== filters.currency) return false;
    if (filters.status && s.status !== filters.status) return false;
    return true;
  });
}

export const paymentSourceService = {
  async getAll(filters?: Partial<PaymentSourceFilters>): Promise<PaymentSourceRecord[]> {
    const q = query(collection(db, COL), orderBy('name'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    return filters ? applyFilters(list, filters) : list;
  },

  async getById(id: string): Promise<PaymentSourceRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async create(input: CreatePaymentSourceInput): Promise<PaymentSourceRecord> {
    const data = {
      code: generateCode(),
      name: input.name,
      type: input.type,
      currency: input.currency,
      status: 'active',
      description: input.description ?? '',
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data } as PaymentSourceRecord;
  },

  async update(id: string, input: EditPaymentSourceInput): Promise<PaymentSourceRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('paymentSource.errors.notFound');
    const updates = {
      name: input.name,
      type: input.type,
      description: input.description ?? snap.data().description,
      updatedAt: now(),
    };
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async setStatus(
    id: string,
    status: PaymentSourceRecord['status'],
  ): Promise<PaymentSourceRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('paymentSource.errors.notFound');
    const updates = { status, updatedAt: now() };
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async delete(id: string): Promise<void> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('paymentSource.errors.notFound');
    await deleteDoc(ref);
  },
};
