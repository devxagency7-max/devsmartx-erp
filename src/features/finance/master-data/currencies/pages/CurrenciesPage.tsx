import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCurrencies } from '../hooks/useCurrencies';
import { StatusBadge } from '../../shared/components/StatusBadge';

export default function CurrenciesPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
      { label: t('masterData.currencies.title') },
    ]);
  }, [setItems, t]);

  const { data: currencies = [], isLoading } = useCurrencies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('masterData.currencies.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('masterData.currencies.description')}</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.code')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.currencies.symbol')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.currencies.decimals')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('masterData.fields.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currencies.map((c) => (
                <tr key={c.code} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.symbol}</td>
                  <td className="px-4 py-3 text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.decimals}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
