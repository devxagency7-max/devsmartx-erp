import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { PasswordField } from './PasswordField';
import { useLogin } from '../hooks/useLogin';
import { ROUTE_PATHS } from '@/app/router/constants';

function useLoginSchema() {
  const { t } = useTranslation();
  return z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.validation.passwordRequired'))
      .min(6, t('auth.validation.passwordMin')),
  });
}

type LoginFormValues = { email: string; password: string };

export function LoginForm() {
  const { t } = useTranslation();
  const schema = useLoginSchema();
  const { login, isLoading, error, clearError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: LoginFormValues) {
    clearError();
    const ok = await login({ email: values.email, password: values.password });
    if (ok) toast.success(t('dashboard.welcomeBack'));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label={t('auth.signIn')}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--card-foreground))]">
          {t('auth.signIn')}
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('auth.enterCredentials')}</p>
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

        <PasswordField
          id="password"
          label={t('auth.password')}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            to={ROUTE_PATHS.FORGOT_PASSWORD}
            className="text-xs text-[hsl(var(--primary))] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] rounded"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </div>
    </form>
  );
}
