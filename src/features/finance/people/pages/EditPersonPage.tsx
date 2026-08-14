import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { usePerson, useUpdatePerson } from '../hooks/usePeople';
import { createPersonSchema, type CreatePersonFormValues } from '../validation/person.schema';
import { PersonForm } from '../components/PersonForm';

export default function EditPersonPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { setItems } = useBreadcrumb();
  const { data: person, isLoading } = usePerson(id);
  const updateMutation = useUpdatePerson();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.PAYMENT_SOURCES },
      { label: t('person.title'), path: ROUTE_PATHS.PEOPLE },
      { label: person?.name ?? '…', path: ROUTE_PATHS.PERSON_DETAILS.replace(':id', id) },
      { label: t('common.edit') },
    ]);
  }, [setItems, t, person, id]);

  const form = useForm<CreatePersonFormValues>({
    resolver: zodResolver(createPersonSchema),
  });

  useEffect(() => {
    if (person) {
      form.reset({
        name: person.name,
        email: person.email ?? '',
        phone: person.phone ?? '',
        type: person.type,
        notes: person.notes,
      });
    }
  }, [person, form]);

  const onSubmit = async (values: CreatePersonFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        input: { ...values, email: values.email || null, phone: values.phone || null },
      });
      toast.success(t('person.updateSuccess'));
      navigate(ROUTE_PATHS.PERSON_DETAILS.replace(':id', id));
    } catch {
      toast.error(t('common.errors.unknown'));
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!person) {
    return <div className="text-center py-16 text-muted-foreground">{t('person.notFound')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('common.edit')}: {person.name}</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">{person.code}</p>
      </div>
      <PersonForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={updateMutation.isPending}
        onCancel={() => navigate(ROUTE_PATHS.PERSON_DETAILS.replace(':id', id))}
      />
    </div>
  );
}
