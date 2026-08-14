import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCreateCommitment } from '../hooks/useCommitments';
import { createCommitmentSchema, type CreateCommitmentFormValues } from '../validation/commitment.schema';
import { CommitmentForm } from '../components/CommitmentForm';

export default function CreateCommitmentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const createMutation = useCreateCommitment();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('commitment.title'), path: ROUTE_PATHS.COMMITMENTS },
      { label: t('commitment.addNew') },
    ]);
  }, [setItems, t]);

  const form = useForm<CreateCommitmentFormValues>({
    resolver: zodResolver(createCommitmentSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: null,
      defaultPaymentSourceId: null,
      defaultPaymentMethodId: null,
      amount: 0,
      currency: 'EGP',
      frequency: 'Monthly',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      vendorName: '',
      notes: '',
    },
  });

  const onSubmit = async (values: CreateCommitmentFormValues) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        amount: Number(values.amount),
      });
      toast.success(t('commitment.createSuccess'));
      navigate(ROUTE_PATHS.COMMITMENTS);
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('commitment.addNew')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('commitment.createDescription')}</p>
      </div>
      <CommitmentForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={createMutation.isPending}
        onCancel={() => navigate(ROUTE_PATHS.COMMITMENTS)}
      />
    </div>
  );
}
