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
import type { PartnerRecord, CreatePartnerInput, PartnerFilters } from '../types/partner.types';

const COL = 'partners';
const now = () => new Date().toISOString();

function docToRecord(id: string, data: Record<string, unknown>): PartnerRecord {
  return {
    id,
    code: data.code as string,
    name: data.name as string,
    email: (data.email as string) ?? '',
    phone: (data.phone as string) ?? '',
    status: data.status as PartnerRecord['status'],
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

export const partnerService = {
  async getAll(filters?: Partial<PartnerFilters>): Promise<PartnerRecord[]> {
    const q = query(collection(db, COL), orderBy('name'));
    const snap = await getDocs(q);
    let list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.code.toLowerCase().includes(s) ||
          p.email.toLowerCase().includes(s),
      );
    }
    if (filters?.status) list = list.filter((p) => p.status === filters.status);
    return list;
  },

  async getById(id: string): Promise<PartnerRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const all = await partnerService.getAll();
    return !all.some(
      (p) => p.code.toLowerCase() === code.toLowerCase() && p.id !== excludeId,
    );
  },

  async create(input: CreatePartnerInput): Promise<PartnerRecord> {
    if (!(await partnerService.isCodeUnique(input.code)))
      throw new Error('masterData.errors.codeTaken');
    const data = {
      code: input.code.toUpperCase(),
      name: input.name,
      email: input.email ?? '',
      phone: input.phone ?? '',
      status: 'active' as const,
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data };
  },

  async update(id: string, input: Partial<CreatePartnerInput>): Promise<PartnerRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('masterData.errors.notFound');
    const updates = { ...input, updatedAt: now() };
    await updateDoc(ref, updates as Record<string, unknown>);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async setStatus(id: string, status: 'active' | 'inactive'): Promise<PartnerRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('masterData.errors.notFound');
    const updates = { status, updatedAt: now() };
    await updateDoc(ref, updates);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async delete(id: string): Promise<void> {
    const ref = doc(db, COL, id);
    if (!(await getDoc(ref)).exists()) throw new Error('masterData.errors.notFound');
    await deleteDoc(ref);
  },
};
