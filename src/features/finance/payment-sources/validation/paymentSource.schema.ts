import { z } from 'zod';
import { PaymentSourceType } from '../types/paymentSource.types';

const paymentSourceTypeValues = Object.values(PaymentSourceType) as [string, ...string[]];

export const createPaymentSourceSchema = z.object({
  name: z.string().min(1, { message: 'paymentSource.validation.nameRequired' }),
  type: z.enum(paymentSourceTypeValues as [PaymentSourceType, ...PaymentSourceType[]], {
    message: 'paymentSource.validation.typeRequired',
  }),
  currency: z.enum(['EGP', 'USD', 'EUR', 'SAR', 'AED'], {
    message: 'paymentSource.validation.currencyRequired',
  }),
  description: z.string().optional(),
});

export const editPaymentSourceSchema = z.object({
  name: z.string().min(1, { message: 'paymentSource.validation.nameRequired' }),
  type: z.enum(paymentSourceTypeValues as [PaymentSourceType, ...PaymentSourceType[]], {
    message: 'paymentSource.validation.typeRequired',
  }),
  description: z.string().optional(),
});

export type CreatePaymentSourceFormValues = z.infer<typeof createPaymentSourceSchema>;
export type EditPaymentSourceFormValues = z.infer<typeof editPaymentSourceSchema>;
