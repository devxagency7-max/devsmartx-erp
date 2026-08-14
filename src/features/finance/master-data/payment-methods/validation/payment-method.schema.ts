import { z } from 'zod';

export const paymentMethodSchema = z.object({
  code: z.string().min(1, { message: 'masterData.validation.codeRequired' }).max(20),
  name: z.string().min(1, { message: 'masterData.validation.nameRequired' }).max(100),
  description: z.string().max(300).optional(),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;
export const paymentMethodDefaultValues: PaymentMethodFormValues = { code: '', name: '', description: '' };
