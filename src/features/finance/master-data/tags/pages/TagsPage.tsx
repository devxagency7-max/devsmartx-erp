import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBreadcrumb } from '@/shared/layout/BreadcrumbContext';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useTags, useCreateTag, useUpdateTag, useTagActions } from '../hooks/useTags';
import { tagSchema, tagDefaultValues, type TagFormValues } from '../validation/tag.schema';
import { useTagStore } from '../store/tagStore';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { ColorDot } from '../../shared/components/ColorDot';
import type { TagRecord } from '../types/tag.types';

const COLOR_PRESETS = ['#EF4444','#F59E0B','#22C55E','#3B82F6','#8B5CF6','#EC4899','#06B6D4','#14B8A6','#64748B'];

function TagForm({ onSubmit, onCancel, defaultValues, isSubmitting }: { onSubmit: (v: TagFormValues) => void; onCancel: () => void; defaultValues: TagFormValues; isSubmitting: boolean }) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TagFormValues>({ resolver: zodResolver(tagSchema), defaultValues });
  const color = watch('color');
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1">{t('masterData.fields.name')} *</label>
        <input {...register('name')} className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        {errors.name && <p className="mt-1 text-xs text-destructive">{t(errors.name.message!)}</p>}
      </div>
      <div className="flex-1 min-w-[220px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1">{t('masterData.tags.color')} *</label>
        <div className="flex items-center gap-2 flex-wrap">
          <ColorDot color={color} />
          {COLOR_PRESETS.map((c) => (
            <button key={c} type="button" onClick={() => setValue('color', c)} className="h-5 w-5 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: color === c ? '#000' : 'transparent' }} />
          ))}
          <input type="color" value={color} onChange={(e) => setValue('color', e.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 p-0" />
        </div>
        {errors.color && <p className="mt-1 text-xs text-destructive">{t(errors.color.message!)}</p>}
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-muted-foreground mb-1">{t('masterData.fields.description')}</label>
        <input {...register('description')} className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
          <Check className="h-3.5 w-3.5" />{t('common.actions.save')}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}

export default function TagsPage() {
  const { t } = useTranslation();
  const { setItems } = useBreadcrumb();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setItems([
      { label: t('nav.finance'), path: ROUTE_PATHS.FINANCE },
      { label: t('masterData.tags.title') },
    ]);
  }, [setItems, t]);

  const { filters, setFilters } = useTagStore();
  const { data: tags = [], isLoading } = useTags(filters);
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const { setStatus, remove } = useTagActions();

  const handleCreate = async (values: TagFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(t('masterData.tags.createSuccess'));
      setShowCreate(false);
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t('common.errors.unknown'));
    }
  };

  const handleUpdate = async (tag: TagRecord, values: TagFormValues) => {
    try {
      await updateMutation.mutateAsync({ id: tag.id, input: values });
      toast.success(t('masterData.tags.updateSuccess'));
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t('common.errors.unknown'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('masterData.tags.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('masterData.tags.description')}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
          <Plus className="h-4 w-4" />{t('masterData.tags.addNew')}
        </button>
      </div>

      <div className="flex gap-3">
        <input value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} placeholder={t('masterData.filters.search')} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {showCreate && (
        <TagForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} defaultValues={tagDefaultValues} isSubmitting={createMutation.isPending} />
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">{t('masterData.tags.empty')}</p>
          </div>
        ) : tags.map((tag) => (
          <div key={tag.id}>
            {editingId === tag.id ? (
              <TagForm
                onSubmit={(v) => handleUpdate(tag, v)}
                onCancel={() => setEditingId(null)}
                defaultValues={{ name: tag.name, color: tag.color, description: tag.description || '' }}
                isSubmitting={updateMutation.isPending}
              />
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/30 transition-colors">
                <ColorDot color={tag.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{tag.name}</span>
                    <StatusBadge status={tag.status} />
                  </div>
                  {tag.description && <p className="text-xs text-muted-foreground mt-0.5">{tag.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingId(tag.id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setStatus.mutate({ id: tag.id, status: tag.status === 'active' ? 'inactive' : 'active' })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={tag.status === 'active' ? t('masterData.actions.deactivate') : t('masterData.actions.activate')}>
                    <span className={`text-xs font-medium ${tag.status === 'active' ? 'text-green-500' : 'text-gray-400'}`}>{tag.status === 'active' ? '●' : '○'}</span>
                  </button>
                  <button onClick={() => { if (window.confirm(t('common.confirmDelete'))) remove.mutate(tag.id); }} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
