import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCreatePerson } from '../hooks/usePeople';
import { createPersonSchema, type CreatePersonFormValues } from '../validation/person.schema';
import { PersonForm } from '../components/PersonForm';

export default function CreatePersonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const createMutation = useCreatePerson();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('person.title'), path: ROUTE_PATHS.PEOPLE },
      { label: t('person.addNew') },
    ]);
  }, [setItems, t]);

  const form = useForm<CreatePersonFormValues>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'Employee',
      notes: '',
    },
  });

  const onSubmit = async (values: CreatePersonFormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        ...values,
        email: values.email || null,
        phone: values.phone || null,
      });
      toast.success(t('person.createSuccess'));
      navigate(ROUTE_PATHS.PERSON_DETAILS.replace(':id', created.id));
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('person.addNew')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('person.createDescription')}</p>
      </div>
      <PersonForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={createMutation.isPending}
        onCancel={() => navigate(ROUTE_PATHS.PEOPLE)}
      />
    </div>
  );
}
