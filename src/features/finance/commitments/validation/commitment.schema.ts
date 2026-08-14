import { z } from 'zod';

export const createCommitmentSchema = z.object({
  name: z.string().min(1, 'commitment.validation.nameRequired').max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().nullable().optional(),
  defaultPaymentSourceId: z.string().nullable().optional(),
  defaultPaymentMethodId: z.string().nullable().optional(),
  amount: z
    .number({ message: 'commitment.validation.amountNumber' })
    .positive('commitment.validation.amountPositive'),
  currency: z.string().min(1, 'commitment.validation.currencyRequired'),
  frequency: z.enum(['Weekly', 'Monthly', 'Quarterly', 'SemiAnnual', 'Yearly', 'Custom']),
  startDate: z.string().min(1, 'commitment.validation.startDateRequired'),
  endDate: z.string().nullable().optional(),
  vendorName: z.string().max(100).optional(),
  relatedProjectId: z.string().nullable().optional(),
  notes: z.string().max(1000).optional(),
});

export const recordPaymentSchema = z.object({
  commitmentId: z.string().min(1),
  paymentSourceId: z.string().min(1, 'commitment.validation.paymentSourceRequired'),
  amount: z
    .number({ message: 'commitment.validation.amountNumber' })
    .positive('commitment.validation.amountPositive'),
  currency: z.string().min(1, 'commitment.validation.currencyRequired'),
  paymentMethodId: z.string().min(1, 'commitment.validation.paymentMethodRequired'),
  categoryId: z.string().min(1, 'commitment.validation.categoryRequired'),
  paidAt: z.string().min(1, 'commitment.validation.dateRequired'),
  notes: z.string().max(500).optional(),
});

export type CreateCommitmentFormValues = z.infer<typeof createCommitmentSchema>;
export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
