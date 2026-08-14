import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { Button } from '@/shared/components/ui/button';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getLedgerExportColumns } from '../export/ledgerExportColumns';
import { usePerson, usePersonLedger, usePersonBalances, useAddLedgerEntry } from '../hooks/usePeople';
import { useCategories } from '@/features/finance/master-data/categories/hooks/useCategories';
import { addLedgerEntrySchema, type AddLedgerEntryFormValues } from '../validation/person.schema';
import type { LedgerDirection } from '../types/person.types';

const DIRECTION_COLORS: Record<LedgerDirection, string> = {
  PERSON_OWES_COMPANY: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  COMPANY_OWES_PERSON: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function PersonLedgerPage() {
  const { t, i18n } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: person } = usePerson(id);
  const { data: entries = [], isLoading } = usePersonLedger(id);
  const { data: balances = [] } = usePersonBalances(id);
  const { data: categories = [] } = useCategories();
  const addEntry = useAddLedgerEntry();
  const { exportData, isExporting } = useExcelExport();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('person.title'), path: ROUTE_PATHS.PEOPLE },
      { label: person?.name ?? '…', path: ROUTE_PATHS.PERSON_DETAILS.replace(':id', id) },
      { label: t('person.ledger') },
    ]);
  }, [setItems, t, person, id]);

  const form = useForm<AddLedgerEntryFormValues>({
    resolver: zodResolver(addLedgerEntrySchema),
    defaultValues: {
      personId: id,
      direction: 'PERSON_OWES_COMPANY',
      amount: 0,
      currency: 'EGP',
      reason: '',
      categoryId: null,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const handleExportAll = useCallback(async () => {
    await exportData({
      fileName: generateFileName(`Ledger_${person?.name ?? id}`, 'all', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('person.ledger')),
      data: entries,
      columns: getLedgerExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'all',
    });
  }, [exportData, entries, t, i18n, person, id]);

  const onAddEntry = async (values: AddLedgerEntryFormValues) => {
    try {
      await addEntry.mutateAsync({ ...values, amount: Number(values.amount) });
      toast.success(t('person.entryAdded'));
      setShowAddForm(false);
      form.reset({ personId: id, direction: 'PERSON_OWES_COMPANY', amount: 0, currency: 'EGP', reason: '', categoryId: null, date: new Date().toISOString().slice(0, 10), notes: '' });
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(ROUTE_PATHS.PERSON_DETAILS.replace(':id', id))}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {person?.name ?? t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <ExportButton
            onExportAll={handleExportAll}
            isDisabled={entries.length === 0}
            isExporting={isExporting}
            size="sm"
          />
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <PlusCircle className="h-4 w-4 me-1" />
            {t('person.addEntry')}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-foreground">
          {t('person.ledger')}: {person?.name}
        </h1>
      </div>

      {balances.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {balances.map((b) => (
            <div key={b.currency} className="rounded-xl border border-border bg-card p-4 flex justify-between items-center">
              <div className="text-sm">
                {b.direction === 'Settled' ? (
                  <span className="text-muted-foreground font-medium">{t('person.settled')}</span>
                ) : b.direction === 'PERSON_OWES_COMPANY' ? (
                  <div>
                    <div className="font-semibold text-orange-600 dark:text-orange-400">{t('person.personOwesCompany')}</div>
                    <div className="text-xs text-muted-foreground">{b.currency}</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{t('person.companyOwesPerson')}</div>
                    <div className="text-xs text-muted-foreground">{b.currency}</div>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold tabular-nums">
                {b.netAmount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('person.addEntry')}</h2>
          <form onSubmit={form.handleSubmit(onAddEntry)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">{t('person.direction')} *</label>
              <select {...form.register('direction')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="PERSON_OWES_COMPANY">{t('person.direction_PERSON_OWES_COMPANY')}</option>
                <option value="COMPANY_OWES_PERSON">{t('person.direction_COMPANY_OWES_PERSON')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.amount')} *</label>
              <input {...form.register('amount', { valueAsNumber: true })} type="number" min="0" step="0.01" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.currency')} *</label>
              <select {...form.register('currency')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {['EGP', 'USD', 'EUR', 'SAR', 'AED'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">{t('person.reason')} *</label>
              <input {...form.register('reason')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {form.formState.errors.reason && <p className="mt-1 text-xs text-destructive">{form.formState.errors.reason.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('export.columns.category')}</label>
              <select {...form.register('categoryId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('commitment.noCategory')}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('commitment.startDate')} *</label>
              <input {...form.register('date')} type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">{t('person.notes')}</label>
              <input {...form.register('notes')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={addEntry.isPending}>
                {addEntry.isPending ? t('common.loading') : t('person.addEntry')}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{t('person.noEntries')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.referenceNumber')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.paidAt')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('person.direction')}</th>
                <th className="px-4 py-3 text-end font-medium text-muted-foreground">{t('export.columns.amount')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('person.reason')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.reference}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${DIRECTION_COLORS[e.direction]}`}>
                      {t(`person.direction_${e.direction}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end font-semibold tabular-nums">
                    {e.amount.toLocaleString()} {e.currency}
                  </td>
                  <td className="px-4 py-3 text-foreground">{e.reason}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t(`person.entryStatus_${e.status}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
