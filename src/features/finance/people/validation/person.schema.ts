import { z } from 'zod';

export const createPersonSchema = z.object({
  name: z.string().min(1, 'person.validation.nameRequired').max(100),
  email: z.string().email('person.validation.emailInvalid').nullable().optional().or(z.literal('')),
  phone: z.string().max(30).nullable().optional(),
  type: z.enum(['Partner', 'Employee', 'Contractor', 'SupplierContact', 'Other']),
  notes: z.string().max(500).optional(),
});

export const addLedgerEntrySchema = z.object({
  personId: z.string().min(1),
  direction: z.enum(['PERSON_OWES_COMPANY', 'COMPANY_OWES_PERSON']),
  amount: z
    .number({ message: 'person.validation.amountNumber' })
    .positive('person.validation.amountPositive'),
  currency: z.string().min(1, 'person.validation.currencyRequired'),
  reason: z.string().min(1, 'person.validation.reasonRequired').max(200),
  categoryId: z.string().nullable().optional(),
  relatedProjectId: z.string().nullable().optional(),
  date: z.string().min(1, 'person.validation.dateRequired'),
  notes: z.string().max(500).optional(),
});

export const createSettlementSchema = z.object({
  personId: z.string().min(1),
  settlementDirection: z.enum(['PERSON_OWES_COMPANY', 'COMPANY_OWES_PERSON']),
  paymentSourceId: z.string().min(1, 'person.validation.paymentSourceRequired'),
  amount: z
    .number({ message: 'person.validation.amountNumber' })
    .positive('person.validation.amountPositive'),
  currency: z.string().min(1, 'person.validation.currencyRequired'),
  paymentMethodId: z.string().min(1, 'person.validation.paymentMethodRequired'),
  categoryId: z.string().min(1, 'person.validation.categoryRequired'),
  settledAt: z.string().min(1, 'person.validation.dateRequired'),
  notes: z.string().max(500).optional(),
});

export type CreatePersonFormValues = z.infer<typeof createPersonSchema>;
export type AddLedgerEntryFormValues = z.infer<typeof addLedgerEntrySchema>;
export type CreateSettlementFormValues = z.infer<typeof createSettlementSchema>;
