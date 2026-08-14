import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { ExportButton, useExcelExport, generateFileName, sanitizeSheetName } from '@/shared/export';
import { getCommitmentExportColumns } from '../export/commitmentExportColumns';
import { useCommitments, useCommitmentActions } from '../hooks/useCommitments';
import { useCommitmentStore } from '../store/commitmentStore';
import { getDueWindow } from '../utils/commitmentHelpers';
import type { CommitmentDueWindow, CommitmentStatus } from '../types/commitment.types';

const DUE_WINDOW_COLORS: Record<CommitmentDueWindow, string> = {
  Overdue: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20',
  DueToday: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
  DueSoon: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
  Upcoming: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20',
  Paid: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
};

const STATUS_COLORS: Record<CommitmentStatus, string> = {
  Active: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  Paused: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
  Completed: 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20',
  Cancelled: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
  Expired: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20',
};

export default function RecurringCommitmentsListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { filters, setFilters } = useCommitmentStore();
  const { data: commitments = [], isLoading } = useCommitments(filters);
  const { remove } = useCommitmentActions();
  const { exportData, isExporting } = useExcelExport();

  const hasFilters = Object.values(filters).some((v) => v !== '');

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('commitment.title') },
    ]);
  }, [setItems, t]);

  const handleExportAll = useCallback(async () => {
    await exportData({
      fileName: generateFileName('Commitments', 'all', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('commitment.title')),
      data: commitments,
      columns: getCommitmentExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'all',
    });
  }, [exportData, commitments, t, i18n]);

  const handleExportFiltered = useCallback(async () => {
    await exportData({
      fileName: generateFileName('Commitments', 'filtered', new Date(), i18n.language),
      sheetName: sanitizeSheetName(t('commitment.title')),
      data: commitments,
      columns: getCommitmentExportColumns(t),
      locale: i18n.language,
      direction: i18n.dir() as 'ltr' | 'rtl',
      includeMetadata: true,
      exportMode: 'filtered',
    });
  }, [exportData, commitments, t, i18n]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('commitment.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('commitment.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            onExportAll={handleExportAll}
            onExportFiltered={hasFilters ? handleExportFiltered : undefined}
            hasFilters={hasFilters}
            isDisabled={commitments.length === 0}
            isExporting={isExporting}
            size="sm"
          />
          <button
            onClick={() => navigate(ROUTE_PATHS.COMMITMENTS_NEW)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            {t('commitment.addNew')}
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
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('commitment.allStatuses')}</option>
          {(['Active', 'Paused', 'Completed', 'Cancelled', 'Expired'] as const).map((s) => (
            <option key={s} value={s}>{t(`commitment.status_${s}`)}</option>
          ))}
        </select>
        <select
          value={filters.frequency}
          onChange={(e) => setFilters({ frequency: e.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('commitment.allFrequencies')}</option>
          {(['Weekly', 'Monthly', 'Quarterly', 'SemiAnnual', 'Yearly', 'Custom'] as const).map((f) => (
            <option key={f} value={f}>{t(`commitment.frequency_${f}`)}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            {t('common.loading')}
          </div>
        ) : commitments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <CalendarClock className="h-10 w-10 opacity-30" />
            <p className="text-sm">{t('commitment.empty')}</p>
            <button
              onClick={() => navigate(ROUTE_PATHS.COMMITMENTS_NEW)}
              className="text-sm text-primary hover:underline"
            >
              {t('commitment.addNew')}
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.vendor')}</th>
                <th className="px-4 py-3 text-end font-medium text-muted-foreground">{t('export.columns.amount')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.frequency')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.nextDueDate')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('commitment.dueWindow')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('export.columns.status')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {commitments.map((c) => {
                const dueWindow = getDueWindow(c.nextDueDate, c.status);
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.code}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.vendorName || '—'}</td>
                    <td className="px-4 py-3 text-end font-semibold tabular-nums">
                      {c.amount.toLocaleString()} {c.currency}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t(`commitment.frequency_${c.frequency}`)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.nextDueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${DUE_WINDOW_COLORS[dueWindow]}`}>
                        {t(`commitment.dueWindow_${dueWindow}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                        {t(`commitment.status_${c.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(ROUTE_PATHS.COMMITMENT_DETAILS.replace(':id', c.id))}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(ROUTE_PATHS.COMMITMENT_EDIT.replace(':id', c.id))}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t('common.confirmDelete'))) {
                              remove.mutate(c.id);
                              toast.success(t('commitment.deleteSuccess'));
                            }
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
