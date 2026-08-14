import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { PaymentMethod } from '@/features/finance/domain/enums/PaymentMethod';
import { transactionSchema, type TransactionSchema } from '../validation/transaction.schema';
import { getTypeConfig } from '../utils/transactionTypeConfig';
import { PartnerContributionsSection } from './PartnerContributionsSection';
import { FileUploader } from '@/shared/upload/components/FileUploader';
import type { UploadResult } from '@/shared/upload';
import type { CurrencyCode, PartnerContributionEntry } from '../types/transaction.types';

const TX_TYPES = Object.values(TransactionType).filter(
  (t) => t !== TransactionType.OpeningBalance && t !== TransactionType.PartnerContribution,
);
const PAYMENT_METHODS = Object.values(PaymentMethod);
const CURRENCIES: CurrencyCode[] = ['EGP', 'USD', 'EUR', 'SAR', 'AED'];

interface PaymentSourceOption {
  id: string;
  name: string;
  currency: string;
}

interface TransactionFormProps {
  defaultValues?: Partial<TransactionSchema>;
  paymentSources: PaymentSourceOption[];
  onSubmit: (values: TransactionSchema, contributions: PartnerContributionEntry[], attachments: UploadResult[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
  readOnly?: boolean;
  mode?: 'create' | 'edit';
}

export function TransactionForm({
  defaultValues,
  paymentSources,
  onSubmit,
  isLoading,
  error,
  onCancel,
  readOnly = false,
  mode = 'create',
}: TransactionFormProps) {
  const { t } = useTranslation();
  const [contributions, setContributions] = useState<PartnerContributionEntry[]>([]);
  const [attachments, setAttachments] = useState<UploadResult[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TransactionType.Expense,
      paymentSourceId: '',
      destinationPaymentSourceId: '',
      partnerId: '',
      originalTransactionId: '',
      amount: 0,
      currency: 'EGP',
      paymentMethod: PaymentMethod.Cash,
      categoryId: '',
      description: '',
      notes: '',
      transactionDate: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  });

  const selectedType = watch('type');
  const selectedPaymentSourceId = watch('paymentSourceId');
  const watchedAmount = watch('amount');
  const watchedCurrency = watch('currency');
  const config = getTypeConfig(selectedType);

  // Auto-set currency from selected payment source
  useEffect(() => {
    const source = paymentSources.find((s) => s.id === selectedPaymentSourceId);
    if (source) setValue('currency', source.currency as CurrencyCode);
  }, [selectedPaymentSourceId, paymentSources, setValue]);

  // Reset conditional fields when type changes
  useEffect(() => {
    if (!config.showDestinationPaymentSource) setValue('destinationPaymentSourceId', '');
    if (!config.showPartner) setValue('partnerId', '');
    if (!config.showOriginalTransaction) setValue('originalTransactionId', '');
  }, [selectedType, config, setValue]);

  // Reset contributions when type changes away from Expense
  useEffect(() => {
    if (selectedType !== TransactionType.Expense) setContributions([]);
  }, [selectedType]);

  function fe(key: keyof TransactionSchema) {
    const msg = errors[key]?.message;
    return msg ? t(msg as string) : undefined;
  }

  const fieldClass = readOnly ? 'pointer-events-none opacity-60' : '';

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, contributions, attachments))} noValidate className="space-y-5">
      {readOnly && (
        <div className="flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))]">
          <Info size={14} className="mt-0.5 shrink-0" />
          {t('transaction.readOnlyNotice')}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/10 px-3 py-2.5 text-sm text-[hsl(var(--destructive))]"
        >
          {t(error)}
        </div>
      )}

      {/* Transaction Type */}
      <div className={`space-y-1.5 ${fieldClass}`}>
        <Label>{t('transaction.type')}</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={readOnly || mode === 'edit'}
            >
              <SelectTrigger aria-invalid={!!errors.type}>
                <SelectValue placeholder={t('transaction.type')} />
              </SelectTrigger>
              <SelectContent>
                {TX_TYPES.map((tt) => (
                  <SelectItem key={tt} value={tt}>
                    {t(`transaction.type_${tt}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {fe('type') && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{fe('type')}</p>}
      </div>

      {/* Payment Source + Destination Payment Source */}
      <div className={`grid gap-4 ${config.showDestinationPaymentSource ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className={`space-y-1.5 ${fieldClass}`}>
          <Label>{t('transaction.paymentSource')}</Label>
          <Controller
            name="paymentSourceId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                <SelectTrigger aria-invalid={!!errors.paymentSourceId}>
                  <SelectValue placeholder={t('transaction.paymentSource')} />
                </SelectTrigger>
                <SelectContent>
                  {paymentSources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {fe('paymentSourceId') && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{fe('paymentSourceId')}</p>}
        </div>

        {config.showDestinationPaymentSource && (
          <div className={`space-y-1.5 ${fieldClass}`}>
            <Label>{t('transaction.destinationPaymentSource')}</Label>
            <Controller
              name="destinationPaymentSourceId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                  <SelectTrigger aria-invalid={!!errors.destinationPaymentSourceId}>
                    <SelectValue placeholder={t('transaction.destinationPaymentSource')} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentSources
                      .filter((s) => s.id !== selectedPaymentSourceId)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {fe('destinationPaymentSourceId') && (
              <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
                {fe('destinationPaymentSourceId')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Partner (PartnerContribution only) */}
      {config.showPartner && (
        <div className={`space-y-1.5 ${fieldClass}`}>
          <Label>{t('transaction.partner')}</Label>
          <Input
            placeholder={t('transaction.partner')}
            aria-invalid={!!errors.partnerId}
            disabled={readOnly}
            {...register('partnerId')}
          />
          {fe('partnerId') && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{fe('partnerId')}</p>}
        </div>
      )}

      {/* Original Transaction (Refund only) */}
      {config.showOriginalTransaction && (
        <div className={`space-y-1.5 ${fieldClass}`}>
          <Label>{t('transaction.originalTransaction')}</Label>
          <Input
            placeholder="e.g. EXP-20260101-11001"
            aria-invalid={!!errors.originalTransactionId}
            disabled={readOnly}
            {...register('originalTransactionId')}
          />
          {fe('originalTransactionId') && (
            <p role="alert" className="text-xs text-[hsl(var(--destructive))]">
              {fe('originalTransactionId')}
            </p>
          )}
        </div>
      )}

      {/* Amount + Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`space-y-1.5 ${fieldClass}`}>
          <Label htmlFor="amount">{t('transaction.amount')}</Label>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            aria-invalid={!!errors.amount}
            disabled={readOnly}
            {...register('amount', { valueAsNumber: true })}
          />
          {fe('amount') && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{fe('amount')}</p>}
        </div>

        <div className={`space-y-1.5 ${fieldClass}`}>
          <Label>{t('transaction.currency')}</Label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className={`space-y-1.5 ${fieldClass}`}>
        <Label>{t('transaction.paymentMethod')}</Label>
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
              <SelectTrigger aria-invalid={!!errors.paymentMethod}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((pm) => (
                  <SelectItem key={pm} value={pm}>
                    {t(`transaction.pm_${pm}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {fe('paymentMethod') && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{fe('paymentMethod')}</p>}
      </div>

      {/* Hidden: keeps categoryId registered in form schema without showing UI */}
      <div className="hidden">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
      </div>

      {/* Date */}
      <div className={`space-y-1.5 ${fieldClass}`}>
        <Label htmlFor="transactionDate">{t('transaction.transactionDate')}</Label>
        <Input
          id="transactionDate"
          type="date"
          aria-invalid={!!errors.transactionDate}
          disabled={readOnly}
          {...register('transactionDate')}
        />
        {fe('transactionDate') && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{fe('transactionDate')}</p>}
      </div>

      {/* Description */}
      <div className={`space-y-1.5 ${fieldClass}`}>
        <Label htmlFor="description">{t('transaction.description')}</Label>
        <Input
          id="description"
          placeholder={t('transaction.descriptionPlaceholder')}
          aria-invalid={!!errors.description}
          disabled={readOnly}
          {...register('description')}
        />
        {fe('description') && <p role="alert" className="text-xs text-[hsl(var(--destructive))]">{fe('description')}</p>}
      </div>

      {/* Notes */}
      <div className={`space-y-1.5 ${fieldClass}`}>
        <Label htmlFor="notes">{t('transaction.notes')}</Label>
        <Textarea
          id="notes"
          placeholder={t('transaction.notesPlaceholder')}
          rows={2}
          disabled={readOnly}
          {...register('notes')}
        />
      </div>

      {/* Partner Contributions (Expense only) */}
      {selectedType === TransactionType.Expense && !readOnly && (
        <PartnerContributionsSection
          totalAmount={typeof watchedAmount === 'number' ? watchedAmount : 0}
          currency={watchedCurrency ?? 'EGP'}
          contributions={contributions}
          onChange={setContributions}
        />
      )}

      {/* Attachments */}
      {!readOnly && (
        <div className="space-y-1.5">
          <Label>{t('transaction.attachments')}</Label>
          <FileUploader
            folder="transactions"
            onUploadComplete={(results) => setAttachments((prev) => [...prev, ...results])}
          />
        </div>
      )}

      {!readOnly && (
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t('common.loading')
              : mode === 'edit'
              ? t('common.save')
              : t('transaction.createTransaction')}
          </Button>
        </div>
      )}
    </form>
  );
}
