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
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type {
  CategoryRecord,
  CategoryTreeNode,
  CreateCategoryInput,
  CategoryFilters,
} from '../types/category.types';

const COL = 'categories';
const now = () => new Date().toISOString();

function docToRecord(id: string, data: Record<string, unknown>): CategoryRecord {
  return {
    id,
    code: data.code as string,
    name: data.name as string,
    color: data.color as string,
    icon: data.icon as string,
    parentId: (data.parentId as string) ?? null,
    parentName: (data.parentName as string) ?? null,
    description: (data.description as string) ?? '',
    status: data.status as CategoryRecord['status'],
    isSystem: (data.isSystem as boolean) ?? false,
    sortOrder: (data.sortOrder as number) ?? 0,
    applicableTypes: (data.applicableTypes as TransactionType[]) ?? [],
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
  };
}

function buildTree(list: CategoryRecord[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  list.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CategoryTreeNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export const categoryService = {
  async getAll(filters?: Partial<CategoryFilters>): Promise<CategoryRecord[]> {
    const q = query(collection(db, COL), orderBy('sortOrder'), orderBy('name'));
    const snap = await getDocs(q);
    let list = snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s),
      );
    }
    if (filters?.status) list = list.filter((c) => c.status === filters.status);
    if (filters?.parentId) list = list.filter((c) => c.parentId === filters.parentId);
    return list;
  },

  async getTree(): Promise<CategoryTreeNode[]> {
    const all = await categoryService.getAll();
    return buildTree(all);
  },

  async getById(id: string): Promise<CategoryRecord | null> {
    const snap = await getDoc(doc(db, COL, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  },

  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const all = await categoryService.getAll();
    return !all.some(
      (c) => c.code.toLowerCase() === code.toLowerCase() && c.id !== excludeId,
    );
  },

  async create(input: CreateCategoryInput): Promise<CategoryRecord> {
    if (!(await categoryService.isCodeUnique(input.code)))
      throw new Error('masterData.errors.codeTaken');
    const parent = input.parentId ? await categoryService.getById(input.parentId) : null;
    const data = {
      code: input.code.toUpperCase(),
      name: input.name,
      color: input.color,
      icon: input.icon,
      parentId: input.parentId || null,
      parentName: parent?.name ?? null,
      description: input.description ?? '',
      status: 'active' as const,
      isSystem: false,
      sortOrder: input.sortOrder,
      applicableTypes: input.applicableTypes,
      createdAt: now(),
      updatedAt: now(),
    };
    const ref = await addDoc(collection(db, COL), data);
    return { id: ref.id, ...data };
  },

  async update(id: string, input: Partial<CreateCategoryInput>): Promise<CategoryRecord> {
    const ref = doc(db, COL, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('masterData.errors.notFound');
    const existing = docToRecord(id, snap.data() as Record<string, unknown>);
    if (existing.isSystem) throw new Error('masterData.errors.systemRecord');
    const parent =
      input.parentId ? await categoryService.getById(input.parentId) : null;
    const updates = {
      ...input,
      parentName: parent?.name ?? existing.parentName,
      updatedAt: now(),
    };
    await updateDoc(ref, updates as Record<string, unknown>);
    return docToRecord(id, { ...snap.data(), ...updates });
  },

  async setStatus(id: string, status: 'active' | 'inactive'): Promise<CategoryRecord> {
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
