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
  CostCenterRecord,
  CreateCostCenterInput,
  CostCenterFilters,
} from '../types/cost-center.types';

const COL = 'costCenters';
const now = () => new Date().toISOString();

function docToRecord(id: string, data: Record<string, unknown>): CostCenterRecord {
  return {
    id,
    code: data.code as string,
    name: data.name as string,
    description: (data.description as string) ?? '',
    status: data.status as CostCenterRecord['status'],
    parentId: (data.parentId as string) ?? null,
    parentName: (data.parentName as string) ?? null,
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

export const costCenterService = {
  async getAll(filters?: Partial<CostCenterFilters>): Promise<CostCenterRecord[]> {
    const q = query(collection(db, COL), orderBy('name'));
    const snap = await getDocs(q);
    let list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s),
      );
    }
    if (filters?.status) list = list.filter((c) => c.status === filters.status);
    return list;
  },

  async getById(id: string): Promise<CostCenterRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const all = await costCenterService.getAll();
    return !all.some(
      (c) => c.code.toLowerCase() === code.toLowerCase() && c.id !== excludeId,
    );
  },

  async create(input: CreateCostCenterInput): Promise<CostCenterRecord> {
    if (!(await costCenterService.isCodeUnique(input.code)))
      throw new Error('masterData.errors.codeTaken');
    const parent = input.parentId ? await costCenterService.getById(input.parentId) : null;
    const data = {
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description ?? '',
      status: 'active' as const,
      parentId: input.parentId || null,
      parentName: parent?.name ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data };
  },

  async update(id: string, input: Partial<CreateCostCenterInput>): Promise<CostCenterRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('masterData.errors.notFound');
    const parent =
      input.parentId ? await costCenterService.getById(input.parentId) : null;
    const updates = {
      ...input,
      parentName: parent?.name ?? (snap.data() as Record<string, unknown>).parentName,
      updatedAt: now(),
    };
    await updateDoc(ref, updates as Record<string, unknown>);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async setStatus(id: string, status: 'active' | 'inactive'): Promise<CostCenterRecord> {
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
