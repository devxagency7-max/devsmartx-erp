import { z } from 'zod';

export const partnerSchema = z.object({
  code: z.string().min(1, { message: 'masterData.validation.codeRequired' }).max(30),
  name: z.string().min(1, { message: 'masterData.validation.nameRequired' }).max(150),
  email: z.string().email({ message: 'masterData.validation.invalidEmail' }),
  phone: z.string().max(30).optional(),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;
export const partnerDefaultValues: PartnerFormValues = { code: '', name: '', email: '', phone: '' };
