import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PageHeader } from '@/shared/components/ui/page-header';
import { EmptyState } from '@/shared/components/ui/empty-state';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { usePaymentSources, usePaymentSourceActions } from '../hooks/usePaymentSources';
import { usePaymentSourceStore } from '../store/paymentSourceStore';
import { PaymentSourceType } from '../types/paymentSource.types';

const STATUS_CLASSES: Record<string, string> = {
  active:   'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  inactive: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20',
  archived: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
};

export default function PaymentSourceListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { paymentSources, isLoading } = usePaymentSources();
  const filters = usePaymentSourceStore((s) => s.filters);
  const setFilters = usePaymentSourceStore((s) => s.setFilters);
  const actions = usePaymentSourceActions();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('paymentSource.title') },
    ]);
  }, [setItems, t]);

  const handleAction = useCallback(
    async (id: string, action: 'activate' | 'deactivate' | 'archive' | 'delete') => {
      if (action === 'delete' && !window.confirm(t('paymentSource.actions.confirmDelete'))) return;
      try {
        await actions.mutateAsync({ id, action });
        toast.success(t('common.save'));
      } catch {
        toast.error(t('common.errors.unknown'));
      }
    },
    [actions, t],
  );

  const typeOptions = Object.values(PaymentSourceType);
  const currencyOptions = ['EGP', 'USD', 'EUR', 'SAR', 'AED'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('paymentSource.title')}
        description={t('paymentSource.moduleDescription')}
        actions={
          <Button onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCES_NEW)}>
            <Plus size={16} />
            {t('paymentSource.newPaymentSource')}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder={t('paymentSource.filters.searchPlaceholder')}
          className="w-full sm:w-56"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value as PaymentSourceType | '' })}
          className="h-9 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <option value="">{t('paymentSource.filters.typeAll')}</option>
          {typeOptions.map((tp) => (
            <option key={tp} value={tp}>{t(`paymentSource.type_${tp}`)}</option>
          ))}
        </select>
        <select
          value={filters.currency}
          onChange={(e) => setFilters({ currency: e.target.value as typeof filters.currency })}
          className="h-9 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <option value="">{t('paymentSource.filters.currencyAll')}</option>
          {currencyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
          className="h-9 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <option value="">{t('paymentSource.filters.statusAll')}</option>
          <option value="active">{t('paymentSource.status_active')}</option>
          <option value="inactive">{t('paymentSource.status_inactive')}</option>
          <option value="archived">{t('paymentSource.status_archived')}</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
          ))}
        </div>
      ) : paymentSources.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t('paymentSource.noPaymentSources')}
          description={t('paymentSource.noPaymentSourcesDesc')}
          action={
            <Button onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCES_NEW)}>
              <Plus size={16} />
              {t('paymentSource.newPaymentSource')}
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.code')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.name')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] hidden sm:table-cell">{t('paymentSource.type')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] hidden md:table-cell">{t('paymentSource.currency')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{t('paymentSource.status')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] hidden lg:table-cell">{t('paymentSource.createdAt')}</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {paymentSources.map((ps) => (
                <tr
                  key={ps.id}
                  className="cursor-pointer transition-colors hover:bg-[hsl(var(--muted))]/30"
                  onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCE_DETAILS.replace(':id', ps.id))}
                >
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">{ps.code}</td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">{ps.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] hidden sm:table-cell">{t(`paymentSource.type_${ps.type}`)}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] hidden md:table-cell">{ps.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[ps.status] ?? STATUS_CLASSES.archived}`}>
                      {t(`paymentSource.status_${ps.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] hidden lg:table-cell">{ps.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
                          <MoreVertical size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCE_DETAILS.replace(':id', ps.id))}>
                          {t('paymentSource.actions.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.PAYMENT_SOURCE_EDIT.replace(':id', ps.id))}>
                          {t('paymentSource.actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {ps.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleAction(ps.id, 'deactivate')}>
                            {t('paymentSource.actions.deactivate')}
                          </DropdownMenuItem>
                        )}
                        {ps.status === 'inactive' && (
                          <DropdownMenuItem onClick={() => handleAction(ps.id, 'activate')}>
                            {t('paymentSource.actions.activate')}
                          </DropdownMenuItem>
                        )}
                        {ps.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => handleAction(ps.id, 'archive')}>
                            {t('paymentSource.actions.archive')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                          onClick={() => handleAction(ps.id, 'delete')}
                        >
                          {t('paymentSource.actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
