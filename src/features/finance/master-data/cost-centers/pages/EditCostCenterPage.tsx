import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCostCenter, useCostCenters, useUpdateCostCenter } from '../hooks/useCostCenters';
import { costCenterSchema, type CostCenterFormValues } from '../validation/cost-center.schema';

export default function EditCostCenterPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { data: center, isLoading } = useCostCenter(id);
  const { data: allCenters = [] } = useCostCenters();
  const updateMutation = useUpdateCostCenter();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CostCenterFormValues>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: { code: '', name: '', description: '', parentId: '' },
  });

  useEffect(() => {
    if (center) {
      reset({ code: center.code, name: center.name, description: center.description || '', parentId: center.parentId || '' });
      setItems([
        { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
        { label: t('masterData.costCenters.title'), path: ROUTE_PATHS.COST_CENTERS },
        { label: center.name },
        { label: t('common.actions.edit') },
      ]);
    }
  }, [center, reset, setItems, t]);

  const onSubmit = async (values: CostCenterFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, input: values });
      toast.success(t('masterData.costCenters.updateSuccess'));
      navigate(ROUTE_PATHS.COST_CENTERS);
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t('common.errors.unknown'));
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.loading')}</div>;
  if (!center) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.notFound')}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t('masterData.costCenters.edit')} — {center.name}</h1>
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
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.costCenters.parent')}</label>
            <select {...register('parentId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t('masterData.costCenters.noParent')}</option>
              {allCenters.filter((cc) => cc.id !== id).map((cc) => <option key={cc.id} value={cc.id}>{cc.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.fields.description')}</label>
            <textarea {...register('description')} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {t('common.actions.save')}
          </button>
          <button type="button" onClick={() => navigate(ROUTE_PATHS.COST_CENTERS)} className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            {t('common.actions.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
