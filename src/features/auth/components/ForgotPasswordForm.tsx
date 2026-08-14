import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { authService } from '@/shared/services/auth/authService';
import { AuthenticationError } from '@/shared/errors/AuthenticationError';
import { ROUTE_PATHS } from '@/app/router/constants';

function useForgotSchema() {
  const { t } = useTranslation();
  return z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
  });
}

type ForgotFormValues = { email: string };

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const schema = useForgotSchema();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: ForgotFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(values.email);
      setSucceeded(true);
    } catch (err) {
      setError(
        err instanceof AuthenticationError
          ? err.message
          : t('common.error'),
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (succeeded) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-4 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-[hsl(var(--foreground))]">{t('auth.resetEmailSent')}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('auth.resetEmailDesc')}{' '}
            <span className="font-medium text-[hsl(var(--foreground))]">{getValues('email')}</span>
          </p>
        </div>
        <Link
          to={ROUTE_PATHS.LOGIN}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-[hsl(var(--primary))] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] rounded"
        >
          <ArrowLeft size={14} />
          {t('auth.backToSignIn')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label={t('auth.resetPassword')}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--card-foreground))]">
          {t('auth.resetPassword')}
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('auth.resetDesc')}</p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/10 px-3 py-2.5 text-sm text-[hsl(var(--destructive))]"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-[hsl(var(--destructive))]">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
        </Button>

        <div className="text-center">
          <Link
            to={ROUTE_PATHS.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] rounded"
          >
            <ArrowLeft size={14} />
            {t('auth.backToSignIn')}
          </Link>
        </div>
      </div>
    </form>
  );
}
