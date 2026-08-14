import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/ui/page-header';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { ExpenseWizard } from '../components/ExpenseWizard';

export function CreateExpensePage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('expense.title'), path: ROUTE_PATHS.EXPENSES },
      { label: t('expense.newExpense') },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('expense.newExpense')}
        description={t('expense.newExpenseDescription')}
      />
      <ExpenseWizard />
    </div>
  );
}

export default CreateExpensePage;
