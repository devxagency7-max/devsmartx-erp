import { z } from 'zod';

export const expenseCategoryStepSchema = z.object({
  categoryId: z.string().min(1, { message: 'expense.validation.categoryRequired' }),
  categoryName: z.string().min(1),
});

export const expensePaymentSourceStepSchema = z.object({
  paymentSourceId: z.string().min(1, { message: 'expense.validation.paymentSourceRequired' }),
  paymentSourceName: z.string().min(1),
  currency: z.string().min(1),
});

export const expensePaymentStepSchema = z.object({
  paymentMethod: z.string().min(1, { message: 'expense.validation.paymentMethodRequired' }),
});

export const expenseDetailsStepSchema = z.object({
  amount: z
    .number({ message: 'expense.validation.amountNumber' })
    .positive({ message: 'expense.validation.amountPositive' }),
  transactionDate: z.string().min(1, { message: 'expense.validation.dateRequired' }),
  vendor: z.string().max(100).optional(),
  description: z.string().min(1, { message: 'expense.validation.descriptionRequired' }).max(500),
  notes: z.string().max(1000).optional(),
});

export const expenseAttachmentsStepSchema = z.object({
  attachments: z.array(z.unknown()),
});

export type ExpenseCategoryStepInput = z.infer<typeof expenseCategoryStepSchema>;
export type ExpensePaymentSourceStepInput = z.infer<typeof expensePaymentSourceStepSchema>;
export type ExpensePaymentStepInput = z.infer<typeof expensePaymentStepSchema>;
export type ExpenseDetailsStepInput = z.infer<typeof expenseDetailsStepSchema>;

// Keep legacy alias so old imports don't break during transition
export const expenseWalletStepSchema = expensePaymentSourceStepSchema;
export type ExpenseWalletStepInput = ExpensePaymentSourceStepInput;
