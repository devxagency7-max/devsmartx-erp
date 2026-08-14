import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getPersonExportColumns } from '../export/personExportColumns';
import { usePeople, usePersonActions } from '../hooks/usePeople';
import { usePersonStore } from '../store/personStore';
import type { PersonStatus, PersonType } from '../types/person.types';

const STATUS_COLORS: Record<PersonStatus, string> = {
  Active: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  Inactive: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
  Archived: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20',
};

const PERSON_TYPES: PersonType[] = ['Partner', 'Employee', 'Contractor', 'SupplierContact', 'Other'];

export default function PeopleListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { filters, setFilters } = usePersonStore();
  const { data: people = [], isLoading } = usePeople(filters);
  const { remove } = usePersonActions();
  const { exportData, isExporting } = useExcelExport();

  const hasFilters = Object.values(filters).some((v) => v !== '');

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('person.title') },
    ]);
  }, [setItems, t]);

  const handleExportAll = useCallback(async () => {
    await exportData({
      fileName: generateFileName('People', 'all', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('person.title')),
      data: people,
      columns: getPersonExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'all',
    });
  }, [exportData, people, t, i18n]);

  const handleExportFiltered = useCallback(async () => {
    await exportData({
      fileName: generateFileName('People', 'filtered', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('person.title')),
      data: people,
      columns: getPersonExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'filtered',
    });
  }, [exportData, people, t, i18n]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('person.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('person.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            onExportAll={handleExportAll}
            onExportFiltered={hasFilters ? handleExportFiltered : undefined}
            hasFilters={hasFilters}
            isDisabled={people.length === 0}
            isExporting={isExporting}
            size="sm"
          />
          <button
            onClick={() => navigate(ROUTE_PATHS.PEOPLE_NEW)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            {t('person.addNew')}
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder={t('masterData.filters.search')}
          className="flex-1 min-w-[180px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('person.allTypes')}</option>
          {PERSON_TYPES.map((type) => (
            <option key={type} value={type}>{t(`person.type_${type}`)}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('masterData.filters.allStatuses')}</option>
          {(['Active', 'Inactive', 'Archived'] as const).map((s) => (
            <option key={s} value={s}>{t(`person.status_${s}`)}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            {t('common.loading')}
          </div>
        ) : people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">{t('person.empty')}</p>
            <button
              onClick={() => navigate(ROUTE_PATHS.PEOPLE_NEW)}
              className="text-sm text-primary hover:underline"
            >
              {t('person.addNew')}
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('person.personType')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.email')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.phone')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {people.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.code}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t(`person.type_${p.type}`)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.email || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                      {t(`person.status_${p.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(ROUTE_PATHS.PERSON_DETAILS.replace(':id', p.id))}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={t('person.viewLedger')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(ROUTE_PATHS.PERSON_EDIT.replace(':id', p.id))}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            remove.mutate(p.id);
                            toast.success(t('person.deleteSuccess'));
                          }
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
