import { z } from 'zod';

export const revenueCategoryStepSchema = z.object({
  categoryId: z.string().min(1, { message: 'revenue.validation.categoryRequired' }),
  categoryName: z.string().min(1),
});

export const revenuePaymentSourceStepSchema = z.object({
  paymentSourceId: z.string().min(1, { message: 'revenue.validation.paymentSourceRequired' }),
  paymentSourceName: z.string().min(1),
  currency: z.string().min(1),
});

export const revenuePaymentStepSchema = z.object({
  paymentMethod: z.string().min(1, { message: 'revenue.validation.paymentMethodRequired' }),
});

export const revenueDetailsStepSchema = z.object({
  amount: z
    .number({ message: 'revenue.validation.amountNumber' })
    .positive({ message: 'revenue.validation.amountPositive' }),
  transactionDate: z.string().min(1, { message: 'revenue.validation.dateRequired' }),
  source: z.string().max(100).optional(),
  relatedProject: z.string().max(100).optional(),
  description: z.string().min(1, { message: 'revenue.validation.descriptionRequired' }).max(500),
  notes: z.string().max(1000).optional(),
});

export type RevenueCategoryStepInput = z.infer<typeof revenueCategoryStepSchema>;
export type RevenuePaymentSourceStepInput = z.infer<typeof revenuePaymentSourceStepSchema>;
export type RevenuePaymentStepInput = z.infer<typeof revenuePaymentStepSchema>;
export type RevenueDetailsStepInput = z.infer<typeof revenueDetailsStepSchema>;

// Keep legacy alias so old imports don't break during transition
export const revenueWalletStepSchema = revenuePaymentSourceStepSchema;
export type RevenueWalletStepInput = RevenuePaymentSourceStepInput;
