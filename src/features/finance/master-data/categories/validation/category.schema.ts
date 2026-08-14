import { z } from 'zod';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';

export const categorySchema = z.object({
  code: z.string().min(1, { message: 'masterData.validation.codeRequired' }).max(20),
  name: z.string().min(1, { message: 'masterData.validation.nameRequired' }).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'masterData.validation.invalidColor' }),
  icon: z.string().min(1, { message: 'masterData.validation.iconRequired' }),
  parentId: z.string().optional(),
  sortOrder: z.number({ message: 'masterData.validation.required' }).int().min(0),
  applicableTypes: z.array(z.nativeEnum(TransactionType)).min(1, { message: 'masterData.validation.typeRequired' }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const categoryDefaultValues: CategoryFormValues = {
  code: '',
  name: '',
  description: '',
  color: '#6366F1',
  icon: 'Tag',
  parentId: '',
  sortOrder: 1,
  applicableTypes: [],
};
