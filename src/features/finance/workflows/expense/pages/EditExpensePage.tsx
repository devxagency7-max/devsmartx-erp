import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ErrorState } from '@/shared/components/ui/error-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { updateTransactionUseCase } from '@/features/finance/application/use-cases/impl';
import { useQueryClient } from '@tanstack/react-query';
import { useExpense } from '../hooks/useExpense';
import { EXPENSES_QUERY_KEY } from '../hooks/useExpenses';
import toast from 'react-hot-toast';

const editSchema = z.object({
  amount: z.number({ message: 'expense.validation.amountNumber' }).positive({ message: 'expense.validation.amountPositive' }),
  paymentMethod: z.string().min(1),
  transactionDate: z.string().min(1, { message: 'expense.validation.dateRequired' }),
  description: z.string().min(1, { message: 'expense.validation.descriptionRequired' }).max(500),
  notes: z.string().max(1000).optional(),
});

type EditFormInput = z.infer<typeof editSchema>;

export function EditExpensePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { expense: exp, isLoading, isError, error } = useExpense(id ?? '');
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('expense.title'), path: ROUTE_PATHS.EXPENSES },
      { label: t('expense.editExpense') },
    ]);
  }, [setItems, t]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<EditFormInput>({
    resolver: zodResolver(editSchema),
    values: exp ? {
      amount: exp.amount,
      paymentMethod: exp.paymentMethod,
      transactionDate: exp.transactionDate,
      description: exp.description,
      notes: exp.notes ?? '',
    } : undefined,
  });

  async function onSubmit(data: EditFormInput) {
    if (!id) return;
    const result = await updateTransactionUseCase.execute({
      _type: 'UpdateTransaction',
      transactionId: id,
      patch: {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionDate: data.transactionDate,
        description: data.description,
        notes: data.notes,
      },
      actorId: 'current-user',
    });

    if (result.success) {
      qc.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      toast.success(t('expense.updateSuccess'));
      navigate(ROUTE_PATHS.EXPENSE_DETAILS.replace(':id', id));
    } else {
      toast.error(result.error.message);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) return <ErrorState error={error as Error} />;

  if (!exp || exp.status !== TransactionStatus.Draft) {
    navigate(ROUTE_PATHS.EXPENSES);
    return null;
  }

  const paymentMethodValue = watch('paymentMethod');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('expense.editExpense')}
        description={exp.referenceNumber}
      />

      <Card className="mx-auto max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">{t('transaction.amount')} *</Label>
                <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-xs text-[hsl(var(--destructive))]">{t(errors.amount.message ?? '')}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{t('transaction.currency')}</Label>
                <Input value={exp.currency} readOnly className="bg-[hsl(var(--muted))] font-mono" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('transaction.paymentMethod')} *</Label>
              <Select value={paymentMethodValue} onValueChange={(v) => setValue('paymentMethod', v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentMethod).map((pm) => (
                    <SelectItem key={pm} value={pm}>{t(`transaction.pm_${pm}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transactionDate">{t('transaction.transactionDate')} *</Label>
              <Input id="transactionDate" type="date" {...register('transactionDate')} />
              {errors.transactionDate && <p className="text-xs text-[hsl(var(--destructive))]">{t(errors.transactionDate.message ?? '')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">{t('transaction.description')} *</Label>
              <Input id="description" {...register('description')} />
              {errors.description && <p className="text-xs text-[hsl(var(--destructive))]">{t(errors.description.message ?? '')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">{t('transaction.notes')}</Label>
              <Textarea id="notes" rows={3} {...register('notes')} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTE_PATHS.EXPENSE_DETAILS.replace(':id', id ?? ''))}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditExpensePage;
