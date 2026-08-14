import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, BookOpen, PlusCircle } from 'lucide-react';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { Button } from '@/shared/components/ui/button';
import { usePerson, usePersonBalances } from '../hooks/usePeople';
import type { PersonStatus } from '../types/person.types';

const STATUS_COLORS: Record<PersonStatus, string> = {
  Active: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  Inactive: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
  Archived: 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20',
};

export default function PersonDetailsPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: person, isLoading } = usePerson(id);
  const { data: balances = [] } = usePersonBalances(id);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('person.title'), path: ROUTE_PATHS.PEOPLE },
      { label: person?.name ?? '…' },
    ]);
  }, [setItems, t, person]);

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!person) {
    return <div className="text-center py-16 text-muted-foreground">{t('person.notFound')}</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(ROUTE_PATHS.PEOPLE)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTE_PATHS.PERSON_LEDGER.replace(':id', id))}
          >
            <BookOpen className="h-4 w-4 me-1" />
            {t('person.viewLedger')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTE_PATHS.PERSON_SETTLEMENT.replace(':id', id))}
          >
            <PlusCircle className="h-4 w-4 me-1" />
            {t('person.settle')}
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(ROUTE_PATHS.PERSON_EDIT.replace(':id', id))}
          >
            <Pencil className="h-4 w-4 me-1" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{person.name}</h1>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{person.code}</p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[person.status]}`}>
            {t(`person.status_${person.status}`)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('person.personType')}: </span>
            <span className="font-medium">{t(`person.type_${person.type}`)}</span>
          </div>
          {person.email && (
            <div>
              <span className="text-muted-foreground">{t('export.columns.email')}: </span>
              <span className="font-medium">{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div>
              <span className="text-muted-foreground">{t('export.columns.phone')}: </span>
              <span className="font-medium">{person.phone}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">{t('masterData.fields.createdAt')}: </span>
            <span className="font-medium">{person.createdAt.slice(0, 10)}</span>
          </div>
        </div>

        {person.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{person.notes}</p>
          </div>
        )}
      </div>

      {balances.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">{t('person.balanceSummary')}</h2>
          <div className="space-y-3">
            {balances.map((b) => (
              <div key={b.currency} className="flex items-center justify-between">
                <div className="text-sm">
                  {b.direction === 'Settled' ? (
                    <span className="text-muted-foreground">{b.currency}: {t('person.settled')}</span>
                  ) : b.direction === 'PERSON_OWES_COMPANY' ? (
                    <span className="text-orange-600 dark:text-orange-400">
                      {t('person.personOwesCompany')} ({b.currency})
                    </span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400">
                      {t('person.companyOwesPerson')} ({b.currency})
                    </span>
                  )}
                </div>
                <div className="font-bold tabular-nums">
                  {b.netAmount.toLocaleString()} {b.currency}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
