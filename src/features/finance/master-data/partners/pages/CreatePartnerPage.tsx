import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCreatePartner } from '../hooks/usePartners';
import { partnerSchema, partnerDefaultValues, type PartnerFormValues } from '../validation/partner.schema';

export default function CreatePartnerPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();
  const createMutation = useCreatePartner();

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
      { label: t('masterData.partners.title'), path: ROUTE_PATHS.PARTNERS },
      { label: t('masterData.partners.addNew') },
    ]);
  }, [setItems, t]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: partnerDefaultValues,
  });

  const onSubmit = async (values: PartnerFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(t('masterData.partners.createSuccess'));
      navigate(ROUTE_PATHS.PARTNERS);
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t('common.errors.unknown'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t('masterData.partners.addNew')}</h1>
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
          <button type="button" onClick={() => navigate(ROUTE_PATHS.PARTNERS)} className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            {t('common.actions.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
