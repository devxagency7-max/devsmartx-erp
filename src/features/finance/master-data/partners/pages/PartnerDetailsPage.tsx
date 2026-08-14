import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

      {/* Balance cards */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">الرصيد الحالي</h2>
        {balances.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            لا توجد معاملات مالية مع هذا الشريك بعد
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {balances.map((b) => (
              <div key={b.currency} className={`rounded-xl border p-4 flex items-center gap-4 ${
                b.direction === 'PERSON_OWES_COMPANY'
                  ? 'border-destructive/30 bg-destructive/5'
                  : b.direction === 'COMPANY_OWES_PERSON'
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border bg-card'
              }`}>
                <div className={`rounded-full p-2 ${
                  b.direction === 'PERSON_OWES_COMPANY'
                    ? 'bg-destructive/10 text-destructive'
                    : b.direction === 'COMPANY_OWES_PERSON'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {b.direction === 'PERSON_OWES_COMPANY' ? <TrendingDown className="h-4 w-4" /> :
                   b.direction === 'COMPANY_OWES_PERSON' ? <TrendingUp className="h-4 w-4" /> :
                   <Minus className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {b.direction === 'PERSON_OWES_COMPANY' ? `${partner.name} مدين للشركة` :
                     b.direction === 'COMPANY_OWES_PERSON' ? `الشركة مدينة لـ ${partner.name}` :
                     'رصيد صفري'}
                  </p>
                  <p className={`text-lg font-bold font-mono mt-0.5 ${
                    b.direction === 'PERSON_OWES_COMPANY' ? 'text-destructive' :
                    b.direction === 'COMPANY_OWES_PERSON' ? 'text-green-500' :
                    'text-foreground'
                  }`}>
                    {formatAmount(b.netAmount, b.currency as CurrencyCode)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ledger history */}
      {ledgerEntries.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">سجل المعاملات</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">التاريخ</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">السبب</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">الاتجاه</th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">المبلغ</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {new Date(entry.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{entry.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.direction === 'PERSON_OWES_COMPANY'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {entry.direction === 'PERSON_OWES_COMPANY' ? 'مدين' : 'دائن'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end font-mono font-medium tabular-nums">
                      {formatAmount(entry.amount, entry.currency as CurrencyCode)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.status === 'Settled'
                          ? 'bg-green-500/10 text-green-500'
                          : entry.status === 'Cancelled'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {entry.status === 'Settled' ? 'مسوى' : entry.status === 'Cancelled' ? 'ملغي' : 'معلق'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
