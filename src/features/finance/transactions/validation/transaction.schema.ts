import { z } from 'zod';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { getTypeConfig } from '../utils/transactionTypeConfig';

const CURRENCY_CODES = ['EGP', 'USD', 'EUR', 'SAR', 'AED'] as const;

export const transactionSchema = z
  .object({
    type: z.nativeEnum(TransactionType, { message: 'transaction.validation.typeRequired' }),
    paymentSourceId: z.string().min(1, 'transaction.validation.paymentSourceRequired'),
    destinationPaymentSourceId: z.string(),
    partnerId: z.string(),
    originalTransactionId: z.string(),
    amount: z
      .number({ error: 'transaction.validation.amountNumber' })
      .positive('transaction.validation.amountPositive'),
    currency: z.enum(CURRENCY_CODES, { message: 'transaction.validation.currencyRequired' }),
    paymentMethod: z.nativeEnum(PaymentMethod, { message: 'transaction.validation.paymentMethodRequired' }),
    categoryId: z.string(),
    description: z.string().min(1, 'transaction.validation.descriptionRequired').max(500),
    notes: z.string().max(1000),
    transactionDate: z.string().min(1, 'transaction.validation.dateRequired'),
  })
  .superRefine((data, ctx) => {
    const config = getTypeConfig(data.type);

    if (config.requireDestinationPaymentSource && !data.destinationPaymentSourceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destinationPaymentSourceId'],
        message: 'transaction.validation.destinationPaymentSourceRequired',
      });
    }

    if (
      config.requireDestinationPaymentSource &&
      data.destinationPaymentSourceId === data.paymentSourceId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destinationPaymentSourceId'],
        message: 'transaction.validation.samePaymentSource',
      });
    }

    if (config.requirePartner && !data.partnerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['partnerId'],
        message: 'transaction.validation.partnerRequired',
      });
    }

    if (config.requireOriginalTransaction && !data.originalTransactionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['originalTransactionId'],
        message: 'transaction.validation.originalTransactionRequired',
      });
    }
  });

export type TransactionSchema = z.infer<typeof transactionSchema>;
