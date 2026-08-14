import {
  collection,
  getDocs,
  addDoc,
  query,
  limit,
  where,
} from 'firebase/firestore';
import { db } from './firestore';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { PaymentSourceType } from '@/features/finance/payment-sources/types/paymentSource.types';

async function isEmpty(col: string): Promise<boolean> {
  const snap = await getDocs(query(collection(db, col), limit(1)));
  return snap.empty;
}

async function seedCollection(col: string, records: Record<string, unknown>[]): Promise<void> {
  if (!(await isEmpty(col))) return;
  await Promise.all(records.map((r) => addDoc(collection(db, col), r)));
}

/** Upsert by code — adds missing system records without touching user-created ones */
async function upsertByCode(col: string, records: (Record<string, unknown> & { code: string })[]): Promise<void> {
  await Promise.all(
    records.map(async (r) => {
      const snap = await getDocs(query(collection(db, col), where('code', '==', r.code), limit(1)));
      if (snap.empty) await addDoc(collection(db, col), r);
    }),
  );
}

export async function seedFirestoreIfEmpty(): Promise<void> {
  await Promise.all([
    seedCollection('paymentSources', [
      { code: 'PS-20260101-10001', name: 'Main Bank Account', type: PaymentSourceType.BankAccount, currency: 'EGP', status: 'active', description: 'Primary operating bank account', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'PS-20260101-10002', name: 'Petty Cash', type: PaymentSourceType.PettyCash, currency: 'EGP', status: 'active', description: 'Office petty cash fund', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'PS-20260101-10003', name: 'USD Reserve', type: PaymentSourceType.BankAccount, currency: 'USD', status: 'active', description: 'Foreign currency reserve account', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ]),

    // upsertByCode ensures missing system categories are always added even if collection isn't empty
    upsertByCode('categories', [
      { code: 'RENT', name: 'Office Rent', color: '#EF4444', icon: 'Building2', parentId: null, parentName: null, description: 'Monthly office rent', status: 'active', isSystem: true, sortOrder: 1, applicableTypes: [TransactionType.Expense], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'CLIENT-PAY', name: 'Client Payments', color: '#22C55E', icon: 'Banknote', parentId: null, parentName: null, description: 'Payments received from clients', status: 'active', isSystem: true, sortOrder: 1, applicableTypes: [TransactionType.Revenue], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'INT-TRF', name: 'Internal Transfer', color: '#3B82F6', icon: 'ArrowLeftRight', parentId: null, parentName: null, description: 'Transfers between wallets', status: 'active', isSystem: true, sortOrder: 1, applicableTypes: [TransactionType.Transfer], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'SUPPLIES', name: 'Office Supplies', color: '#F59E0B', icon: 'Package', parentId: null, parentName: null, description: 'Stationery and supplies', status: 'active', isSystem: false, sortOrder: 2, applicableTypes: [TransactionType.Expense], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'SALARIES', name: 'Salaries', color: '#8B5CF6', icon: 'Users', parentId: null, parentName: null, description: 'Employee payroll', status: 'active', isSystem: true, sortOrder: 3, applicableTypes: [TransactionType.Expense], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'UTILS', name: 'Utilities', color: '#06B6D4', icon: 'Zap', parentId: null, parentName: null, description: 'Electricity, water, internet', status: 'active', isSystem: false, sortOrder: 4, applicableTypes: [TransactionType.Expense], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'TECH-EQ', name: 'Equipment & Devices', color: '#6366F1', icon: 'Monitor', parentId: null, parentName: null, description: 'Laptops, phones, and hardware', status: 'active', isSystem: false, sortOrder: 5, applicableTypes: [TransactionType.Expense], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'MARKETING', name: 'Marketing', color: '#EC4899', icon: 'Megaphone', parentId: null, parentName: null, description: 'Ads, campaigns, and promotion', status: 'active', isSystem: false, sortOrder: 6, applicableTypes: [TransactionType.Expense], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'TRAVEL', name: 'Travel', color: '#14B8A6', icon: 'Plane', parentId: null, parentName: null, description: 'Transport and travel costs', status: 'active', isSystem: false, sortOrder: 7, applicableTypes: [TransactionType.Expense], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ]),

    upsertByCode('paymentMethods', [
      { code: 'CASH', name: 'Cash', description: 'Physical cash payment', status: 'active', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'BANK-TRF', name: 'Bank Transfer', description: 'Wire or online bank transfer', status: 'active', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'CARD', name: 'Card', description: 'Credit or debit card', status: 'active', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'INSTAPAY', name: 'Instapay', description: 'Egyptian instant payment', status: 'active', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'VF-CASH', name: 'Vodafone Cash', description: 'Vodafone mobile wallet', status: 'active', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'CHEQUE', name: 'Cheque', description: 'Paper cheque payment', status: 'active', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'OTHER', name: 'Other', description: 'Any other payment method', status: 'active', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ]),

    seedCollection('costCenters', [
      { code: 'MGMT', name: 'Management', description: 'Executive and management costs', status: 'active', parentId: null, parentName: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'TECH', name: 'Technology', description: 'Engineering and IT', status: 'active', parentId: null, parentName: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { code: 'SALES', name: 'Sales', description: 'Sales and business development', status: 'active', parentId: null, parentName: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ]),

    seedCollection('tags', [
      { name: 'Urgent', color: '#EF4444', description: 'Requires immediate attention', status: 'active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { name: 'Recurring', color: '#3B82F6', description: 'Repeats on a schedule', status: 'active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      { name: 'Approved', color: '#22C55E', description: 'Has been approved by management', status: 'active', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ]),
  ]);
}
