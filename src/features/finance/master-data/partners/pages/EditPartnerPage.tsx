import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { usePartner, useUpdatePartner } from '../hooks/usePartners';
import { partnerSchema, type PartnerFormValues } from '../validation/partner.schema';

export default function EditPartnerPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { data: partner, isLoading } = usePartner(id);
  const updateMutation = useUpdatePartner();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { code: '', name: '', email: '', phone: '' },
  });

  useEffect(() => {
    if (partner) {
      reset({ code: partner.code, name: partner.name, email: partner.email, phone: partner.phone || '' });
      setItems([
        { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
        { label: t('masterData.partners.title'), path: ROUTE_PATHS.PARTNERS },
        { label: partner.name, path: ROUTE_PATHS.PARTNER_DETAILS.replace(':id', id) },
        { label: t('common.actions.edit') },
      ]);
    }
  }, [partner, reset, setItems, t, id]);

  const onSubmit = async (values: PartnerFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, input: values });
      toast.success(t('masterData.partners.updateSuccess'));
      navigate(ROUTE_PATHS.PARTNER_DETAILS.replace(':id', id));
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t('common.errors.unknown'));
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.loading')}</div>;
  if (!partner) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.notFound')}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t('masterData.partners.edit')} — {partner.name}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.fields.code')} *</label>
            <input {...register('code')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.code && <p className="mt-1 text-xs text-destructive">{t(errors.code.message!)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.fields.name')} *</label>
            <input {...register('name')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{t(errors.name.message!)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.partners.email')} *</label>
            <input type="email" {...register('email')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{t(errors.email.message!)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.partners.phone')}</label>
            <input {...register('phone')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {t('common.actions.save')}
          </button>
          <button type="button" onClick={() => navigate(ROUTE_PATHS.PARTNER_DETAILS.replace(':id', id))} className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            {t('common.actions.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
