import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { usePartner } from '../hooks/usePartners';
import { StatusBadge } from '../../shared/components/StatusBadge';

export default function PartnerDetailsPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: partner, isLoading } = usePartner(id);

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

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('masterData.fields.status')}</p>
            <div className="mt-1"><StatusBadge status={partner.status} /></div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('masterData.partners.email')}</p>
            <p className="mt-1 text-sm text-foreground">{partner.email}</p>
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
    </div>
  );
}
