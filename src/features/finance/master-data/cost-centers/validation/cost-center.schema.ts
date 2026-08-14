import { z } from 'zod';

export const costCenterSchema = z.object({
  code: z.string().min(1, { message: 'masterData.validation.codeRequired' }).max(20),
  name: z.string().min(1, { message: 'masterData.validation.nameRequired' }).max(100),
  description: z.string().max(400).optional(),
  parentId: z.string().optional(),
});

export type CostCenterFormValues = z.infer<typeof costCenterSchema>;
export const costCenterDefaultValues: CostCenterFormValues = { code: '', name: '', description: '', parentId: '' };
