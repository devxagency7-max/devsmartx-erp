import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCommitment, useUpdateCommitment } from '../hooks/useCommitments';
import { createCommitmentSchema, type CreateCommitmentFormValues } from '../validation/commitment.schema';
import { CommitmentForm } from '../components/CommitmentForm';

export default function EditCommitmentPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: commitment, isLoading } = useCommitment(id);
  const updateMutation = useUpdateCommitment();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('commitment.title'), path: ROUTE_PATHS.COMMITMENTS },
      { label: commitment?.name ?? '…', path: ROUTE_PATHS.COMMITMENT_DETAILS.replace(':id', id) },
      { label: t('common.edit') },
    ]);
  }, [setItems, t, commitment, id]);

  const form = useForm<CreateCommitmentFormValues>({
    resolver: zodResolver(createCommitmentSchema),
  });

  useEffect(() => {
    if (commitment) {
      form.reset({
        name: commitment.name,
        description: commitment.description,
        categoryId: commitment.categoryId,
        defaultPaymentSourceId: commitment.defaultPaymentSourceId,
        defaultPaymentMethodId: commitment.defaultPaymentMethodId,
        amount: commitment.amount,
        currency: commitment.currency,
        frequency: commitment.frequency,
        startDate: commitment.startDate,
        endDate: commitment.endDate,
        vendorName: commitment.vendorName,
        notes: commitment.notes,
      });
    }
  }, [commitment, form]);

  const onSubmit = async (values: CreateCommitmentFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, input: { ...values, amount: Number(values.amount) } });
      toast.success(t('commitment.updateSuccess'));
      navigate(ROUTE_PATHS.COMMITMENT_DETAILS.replace(':id', id));
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!commitment) {
    return <div className="text-center py-16 text-muted-foreground">{t('commitment.notFound')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('commitment.edit')}</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">{commitment.code}</p>
      </div>
      <CommitmentForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
        onCancel={() => navigate(ROUTE_PATHS.COMMITMENT_DETAILS.replace(':id', id))}
      />
    </div>
  );
}
