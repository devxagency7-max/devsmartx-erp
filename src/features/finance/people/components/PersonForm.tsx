import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import type { CreatePersonFormValues } from '../validation/person.schema';
import type { PersonType } from '../types/person.types';

interface PersonFormProps {
  form: UseFormReturn<CreatePersonFormValues>;
  onSubmit: (values: CreatePersonFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const PERSON_TYPES: PersonType[] = ['Partner', 'Employee', 'Contractor', 'SupplierContact', 'Other'];

export function PersonForm({ form, onSubmit, isSubmitting, onCancel }: PersonFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('export.columns.name')} <span className="text-destructive">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('person.namePlaceholder')}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('person.personType')} <span className="text-destructive">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PERSON_TYPES.map((type) => (
                <option key={type} value={type}>{t(`person.type_${type}`)}</option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('export.columns.email')}
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="email@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('export.columns.phone')}
            </label>
            <input
              {...register('phone')}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+20..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('person.notes')}
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
