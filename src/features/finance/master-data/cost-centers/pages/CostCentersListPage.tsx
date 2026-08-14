import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCostCenters, useCostCenterActions } from '../hooks/useCostCenters';
import { useCostCenterStore } from '../store/costCenterStore';
import { StatusBadge } from '../../shared/components/StatusBadge';

export default function CostCentersListPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
      { label: t('masterData.costCenters.title') },
    ]);
  }, [setItems, t]);

  const { filters, setFilters } = useCostCenterStore();
  const { data: centers = [], isLoading } = useCostCenters(filters);
  const { setStatus, remove } = useCostCenterActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('masterData.costCenters.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('masterData.costCenters.description')}</p>
        </div>
        <button onClick={() => navigate(ROUTE_PATHS.COST_CENTERS_NEW)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
          <Plus className="h-4 w-4" />{t('masterData.costCenters.addNew')}
        </button>
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
        ) : centers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">{t('masterData.costCenters.empty')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.code')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.costCenters.parent')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {centers.map((cc) => (
                <tr key={cc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{cc.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{cc.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cc.parentName || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={cc.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(ROUTE_PATHS.COST_CENTER_EDIT.replace(':id', cc.id))} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setStatus.mutate({ id: cc.id, status: cc.status === 'active' ? 'inactive' : 'active' })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        {cc.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button onClick={() => { if (window.confirm(t('common.confirmDelete'))) { remove.mutate(cc.id); toast.success(t('masterData.costCenters.deleteSuccess')); } }} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
