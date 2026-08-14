import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getPartnerExportColumns } from '../export/partnerExportColumns';
import { usePartners, usePartnerActions } from '../hooks/usePartners';
import { usePartnerStore } from '../store/partnerStore';
import { StatusBadge } from '../../shared/components/StatusBadge';

export default function PartnersListPage() {
  const { t, i18n } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
      { label: t('masterData.partners.title') },
    ]);
  }, [setItems, t]);

  const { filters, setFilters } = usePartnerStore();
  const { data: partners = [], isLoading } = usePartners(filters);
  const { setStatus, remove } = usePartnerActions();
  const { exportData, isExporting } = useExcelExport();

  const hasFilters = filters.search !== '' || filters.status !== '';

  const handleExportAll = useCallback(async () => {
    await exportData({
      fileName: generateFileName('Partners', 'all', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('masterData.partners.title')),
      data: partners,
      columns: getPartnerExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'all',
    });
  }, [exportData, partners, t, i18n]);

  const handleExportFiltered = useCallback(async () => {
    await exportData({
      fileName: generateFileName('Partners', 'filtered', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('masterData.partners.title')),
      data: partners,
      columns: getPartnerExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'filtered',
    });
  }, [exportData, partners, t, i18n]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('masterData.partners.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('masterData.partners.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            onExportAll={handleExportAll}
            onExportFiltered={hasFilters ? handleExportFiltered : undefined}
            hasFilters={hasFilters}
            isDisabled={partners.length === 0}
            isExporting={isExporting}
            size="sm"
          />
          <button onClick={() => navigate(ROUTE_PATHS.PARTNERS_NEW)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
            <Plus className="h-4 w-4" />{t('masterData.partners.addNew')}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <input value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} placeholder={t('masterData.filters.search')} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <select value={filters.status} onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">{t('masterData.filters.allStatuses')}</option>
          <option value="active">{t('masterData.status.active')}</option>
          <option value="inactive">{t('masterData.status.inactive')}</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">{t('masterData.partners.empty')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.code')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.partners.email')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.partners.phone')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{p.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(ROUTE_PATHS.PARTNER_DETAILS.replace(':id', p.id))} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => navigate(ROUTE_PATHS.PARTNER_EDIT.replace(':id', p.id))} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setStatus.mutate({ id: p.id, status: p.status === 'active' ? 'inactive' : 'active' })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        {p.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button onClick={() => { if (window.confirm(t('common.confirmDelete'))) { remove.mutate(p.id); toast.success(t('masterData.partners.deleteSuccess')); } }} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
