import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useCategory, useCategories, useUpdateCategory } from '../hooks/useCategories';
import { categorySchema, type CategoryFormValues } from '../validation/category.schema';
import { ColorDot } from '../../shared/components/ColorDot';

const COLOR_PRESETS = ['#EF4444','#F59E0B','#22C55E','#3B82F6','#8B5CF6','#EC4899','#06B6D4','#6366F1'];
const TRANSACTION_TYPES = Object.values(TransactionType);

export default function EditCategoryPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const { data: category, isLoading } = useCategory(id);
  const { data: allCategories = [] } = useCategories();
  const updateMutation = useUpdateCategory();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { code: '', name: '', description: '', color: '#6366F1', icon: 'Tag', parentId: '', sortOrder: 1, applicableTypes: [] },
  });

  const color = watch('color');

  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon,
        parentId: category.parentId || '',
        sortOrder: category.sortOrder,
        applicableTypes: category.applicableTypes,
      });
      setItems([
        { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
        { label: t('masterData.categories.title'), path: ROUTE_PATHS.CATEGORIES },
        { label: category.name },
        { label: t('common.actions.edit') },
      ]);
    }
  }, [category, reset, setItems, t]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, input: values });
      toast.success(t('masterData.categories.updateSuccess'));
      navigate(ROUTE_PATHS.CATEGORIES);
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t('common.errors.unknown'));
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.loading')}</div>;
  if (!category) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t('common.notFound')}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{t('masterData.categories.edit')} — {category.name}</h1>
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
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.categories.color')} *</label>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <ColorDot color={color} />
              {COLOR_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setValue('color', c)} className="h-5 w-5 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: color === c ? '#000' : 'transparent' }} />
              ))}
              <input type="color" value={color} onChange={(e) => setValue('color', e.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 p-0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.categories.icon')} *</label>
            <input {...register('icon')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.icon && <p className="mt-1 text-xs text-destructive">{t(errors.icon.message!)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.categories.parent')}</label>
            <select {...register('parentId')} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t('masterData.categories.noParent')}</option>
              {allCategories.filter((c) => c.id !== id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('masterData.categories.sortOrder')}</label>
            <input type="number" {...register('sortOrder', { valueAsNumber: true })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">{t('masterData.categories.applicableTypes')} *</label>
            <Controller
              control={control}
              name="applicableTypes"
              render={({ field }) => (
                <div className="flex flex-wrap gap-3">
                  {TRANSACTION_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) field.onChange([...field.value, type]);
                          else field.onChange(field.value.filter((v) => v !== type));
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-foreground">{t(`transaction.types.${type}`, type)}</span>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.applicableTypes && <p className="mt-1 text-xs text-destructive">{t(errors.applicableTypes.message!)}</p>}
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
          <button type="button" onClick={() => navigate(ROUTE_PATHS.CATEGORIES)} className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            {t('common.actions.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
