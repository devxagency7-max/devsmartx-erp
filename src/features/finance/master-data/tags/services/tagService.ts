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
import type { TagRecord, CreateTagInput, TagFilters } from '../types/tag.types';

const COL = 'tags';
const now = () => new Date().toISOString();

function docToRecord(id: string, data: Record<string, unknown>): TagRecord {
  return {
    id,
    name: data.name as string,
    color: data.color as string,
    description: (data.description as string) ?? '',
    status: data.status as TagRecord['status'],
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

export const tagService = {
  async getAll(filters?: Partial<TagFilters>): Promise<TagRecord[]> {
    const q = query(collection(db, COL), orderBy('name'));
    const snap = await getDocs(q);
    let list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(s));
    }
    if (filters?.status) list = list.filter((t) => t.status === filters.status);
    return list;
  },

  async getById(id: string): Promise<TagRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async create(input: CreateTagInput): Promise<TagRecord> {
    const all = await tagService.getAll();
    if (all.some((t) => t.name.toLowerCase() === input.name.toLowerCase()))
      throw new Error('masterData.errors.nameTaken');
    const data = {
      name: input.name,
      color: input.color,
      description: input.description ?? '',
      status: 'active' as const,
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data };
  },

  async update(id: string, input: Partial<CreateTagInput>): Promise<TagRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('masterData.errors.notFound');
    const updates = { ...input, updatedAt: now() };
    await updateDoc(ref, updates as Record<string, unknown>);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async setStatus(id: string, status: 'active' | 'inactive'): Promise<TagRecord> {
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
