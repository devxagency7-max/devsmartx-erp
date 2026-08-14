import { z } from 'zod';

export const tagSchema = z.object({
  name: z.string().min(1, { message: 'masterData.validation.nameRequired' }).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'masterData.validation.invalidColor' }),
  description: z.string().max(200).optional(),
});

export type TagFormValues = z.infer<typeof tagSchema>;
export const tagDefaultValues: TagFormValues = { name: '', color: '#3B82F6', description: '' };
