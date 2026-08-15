import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { usePartner } from '../hooks/usePartners';
import { usePersonLedger } from '@/features/finance/people/hooks/usePeople';
import { derivePersonBalances } from '@/features/finance/people/utils/personHelpers';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { formatAmount } from '@/features/finance/transactions/utils/formatAmount';
import type { CurrencyCode } from '@/shared/types/currency';

export default function PartnerDetailsPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: partner, isLoading } = usePartner(id);
  const { data: ledgerEntries = [] } = usePersonLedger(id);
  const balances = derivePersonBalances(ledgerEntries);

  useEffect(() => {
    if (partner) {
      setItems([
        { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
        { label: t('masterData.partners.title'), path: ROUTE_PATHS.PARTNERS },
        { label: partner.name },
      ]);
    }
  }, [partner, setItems, t]);

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.loading')}</div>;
  if (!partner) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.notFound')}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{partner.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{partner.code}</p>
        </div>
        <button onClick={() => navigate(ROUTE_PATHS.PARTNER_EDIT.replace(':id', id))} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Pencil className="h-4 w-4" />{t('common.actions.edit')}
        </button>
      </div>

      {/* Basic info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('masterData.fields.status')}</p>
            <div className="mt-1"><StatusBadge status={partner.status} /></div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('masterData.partners.email')}</p>
            <p className="mt-1 text-sm text-foreground">{partner.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('masterData.partners.phone')}</p>
            <p className="mt-1 text-sm text-foreground">{partner.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('masterData.fields.createdAt')}</p>
            <p className="mt-1 text-sm text-foreground">{new Date(partner.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Balance summary */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">ملخص الحساب</h2>
        {balances.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            لا توجد معاملات مالية مع هذا الشريك بعد
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {balances.map((b) => {
              const owes = b.direction === 'PERSON_OWES_COMPANY';
              const settled = b.direction === 'Settled';
              return (
                <div key={b.currency} className={`rounded-xl border p-4 flex items-center gap-4 ${
                  owes ? 'border-destructive/30 bg-destructive/5'
                  : settled ? 'border-border bg-card'
                  : 'border-green-500/30 bg-green-500/5'
                }`}>
                  <div className={`rounded-full p-2 shrink-0 ${
                    owes ? 'bg-destructive/10 text-destructive'
                    : settled ? 'bg-muted text-muted-foreground'
                    : 'bg-green-500/10 text-green-500'
                  }`}>
                    {owes ? <TrendingDown className="h-4 w-4" />
                    : settled ? <Minus className="h-4 w-4" />
                    : <TrendingUp className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {owes
                        ? `${partner.name} لازم يدفع للشركة`
                        : settled
                        ? 'الحساب متساوي'
                        : `الشركة هترجع لـ ${partner.name}`}
                    </p>
                    <p className={`text-lg font-bold font-mono mt-0.5 ${
                      owes ? 'text-destructive' : settled ? 'text-foreground' : 'text-green-500'
                    }`}>
                      {formatAmount(b.netAmount, b.currency as CurrencyCode)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ledger history */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">سجل المعاملات</h2>
        {ledgerEntries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            لا يوجد سجل بعد
          </div>
        ) : (
          <div className="space-y-2">
            {ledgerEntries.map((entry) => {
              const owes = entry.direction === 'PERSON_OWES_COMPANY';
              // Extract transaction description from reason
              // reason format: "نصيب في مصروف: MacBook" or "مساهمة زائدة في مصروف: MacBook"
              const txName = entry.reason.includes(':')
                ? entry.reason.split(':').slice(1).join(':').trim()
                : entry.reason;

              const label = owes
                ? `عليه ${formatAmount(entry.amount, entry.currency as CurrencyCode)} — لم يدفع في "${txName}"`
                : `له ${formatAmount(entry.amount, entry.currency as CurrencyCode)} — دفع عن غيره في "${txName}"`;

              return (
                <div
                  key={entry.id}
                  className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                    owes ? 'border-destructive/30 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'
                  }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${
                    owes ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {owes ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${owes ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(entry.date).toLocaleDateString('ar-EG')}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        entry.status === 'Settled' ? 'bg-green-500/10 text-green-500'
                        : entry.status === 'Cancelled' ? 'bg-muted text-muted-foreground'
                        : 'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {entry.status === 'Settled' ? 'مسوّى' : entry.status === 'Cancelled' ? 'ملغي' : 'معلق'}
                      </span>
                      {entry.transactionId && (
                        <button
                          onClick={() => navigate(ROUTE_PATHS.TRANSACTION_DETAILS.replace(':id', entry.transactionId!))}
                          className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/20 transition-colors"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          عرض المعاملة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
