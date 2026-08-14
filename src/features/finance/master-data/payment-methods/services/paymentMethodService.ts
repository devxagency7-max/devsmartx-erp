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
import type {
  PaymentMethodRecord,
  CreatePaymentMethodInput,
} from '../types/payment-method.types';

const COL = 'paymentMethods';
const now = () => new Date().toISOString();

function docToRecord(id: string, data: Record<string, unknown>): PaymentMethodRecord {
  return {
    id,
    code: data.code as string,
    name: data.name as string,
    description: (data.description as string) ?? '',
    status: data.status as PaymentMethodRecord['status'],
    isSystem: (data.isSystem as boolean) ?? false,
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

export const paymentMethodService = {
  async getAll(): Promise<PaymentMethodRecord[]> {
    const q = query(collection(db, COL), orderBy('name'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
  },

  async getById(id: string): Promise<PaymentMethodRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async create(input: CreatePaymentMethodInput): Promise<PaymentMethodRecord> {
    const all = await paymentMethodService.getAll();
    if (all.some((m) => m.code.toLowerCase() === input.code.toLowerCase()))
      throw new Error('masterData.errors.codeTaken');
    const data = {
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description ?? '',
      status: 'active' as const,
      isSystem: false,
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data };
  },

  async setStatus(id: string, status: 'active' | 'inactive'): Promise<PaymentMethodRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('masterData.errors.notFound');
    const updates = { status, updatedAt: now() };
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async delete(id: string): Promise<void> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('masterData.errors.notFound');
    if ((snap.data() as Record<string, unknown>).isSystem)
      throw new Error('masterData.errors.systemRecord');
    await deleteDoc(ref);
  },
};
