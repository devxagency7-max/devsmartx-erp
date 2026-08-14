import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getCategoryExportColumns } from '../export/categoryExportColumns';
import { useCategories, useCategoryActions } from '../hooks/useCategories';
import { useCategoryStore } from '../store/categoryStore';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { ColorDot } from '../../shared/components/ColorDot';

export default function CategoryListPage() {
  const { t, i18n } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
      { label: t('masterData.categories.title') },
    ]);
  }, [setItems, t]);

  const { filters, setFilters } = useCategoryStore();
  const { data: categories = [], isLoading } = useCategories(filters);
  const { setStatus, remove } = useCategoryActions();
  const { exportData, isExporting } = useExcelExport();

  const hasFilters = filters.search !== '' || (filters.status !== '' && filters.status !== undefined);

  const handleExportAll = useCallback(async () => {
    await exportData({
      fileName: generateFileName('Categories', 'all', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('masterData.categories.title')),
      data: categories,
      columns: getCategoryExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'all',
    });
  }, [exportData, categories, t, i18n]);

  const handleExportFiltered = useCallback(async () => {
    await exportData({
      fileName: generateFileName('Categories', 'filtered', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('masterData.categories.title')),
      data: categories,
      columns: getCategoryExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'filtered',
    });
  }, [exportData, categories, t, i18n]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('masterData.categories.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('masterData.categories.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            onExportAll={handleExportAll}
            onExportFiltered={hasFilters ? handleExportFiltered : undefined}
            hasFilters={hasFilters}
            isDisabled={categories.length === 0}
            isExporting={isExporting}
            size="sm"
          />
          <button onClick={() => navigate(ROUTE_PATHS.CATEGORIES_NEW)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
            <Plus className="h-4 w-4" />{t('masterData.categories.addNew')}
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

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">{t('masterData.categories.empty')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.code')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.categories.parent')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ColorDot color={cat.color} size="sm" />
                      <span className="font-mono text-xs font-medium">{cat.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.parentName || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={cat.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!cat.isSystem && (
                        <button onClick={() => navigate(ROUTE_PATHS.CATEGORY_EDIT.replace(':id', cat.id))} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-4 w-4" /></button>
                      )}
                      <button onClick={() => setStatus.mutate({ id: cat.id, status: cat.status === 'active' ? 'inactive' : 'active' })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        {cat.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      {!cat.isSystem && (
                        <button onClick={() => { if (window.confirm(t('common.confirmDelete'))) { remove.mutate(cat.id); toast.success(t('masterData.categories.deleteSuccess')); } }} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      )}
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
