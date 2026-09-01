import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Chrome, Eye, EyeOff } from 'lucide-react';
import { signupSchema, type SignupInput } from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { offerToSavePassword } from '@/lib/credentials';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldError, Input, Label } from '@/components/ui/input';

function oauthBanner(errorCode: string | null): string | null {
  if (!errorCode) return null;
  if (!errorCode.startsWith('oauth_') && errorCode !== 'account_suspended') return null;
  if (errorCode === 'oauth_state') return 'Sign-in session expired. Please try again.';
  if (errorCode === 'account_suspended') return 'This account is suspended.';
  return 'Google sign-in failed. Please try again.';
}

export default function SignupPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  });

  const { data: providers } = useQuery({
    queryKey: ['auth', 'providers'],
    queryFn: () => api<{ google: boolean }>('/auth/providers'),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const onSubmit = async (values: SignupInput) => {
    setSubmitError(null);
    try {
      await api('/auth/signup', { method: 'POST', body: values });
      await offerToSavePassword(values.email, values.password, values.name);
      await refresh();
      navigate('/onboarding');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const field = /username/i.test(err.code) || /username/i.test(err.message) ? 'username' : 'email';
        setError(field, { type: 'server', message: err.message });
      } else if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    }
  };

  const banner = oauthBanner(searchParams.get('error'));

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
      <div className="mb-8 flex items-center justify-center gap-2.5">
        <img src="/brand/logo-dark.png" alt="" className="size-10 dark:hidden" aria-hidden />
        <img src="/brand/logo-white.png" alt="" className="hidden size-10 dark:block" aria-hidden />
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-text">Suraksha Labs</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">by Shadow Security</span>
        </span>
      </div>

      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text">Create your account</h1>
        <p className="mt-1.5 text-sm text-text-secondary">Start learning cybersecurity in minutes.</p>

        {banner && (
          <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{banner}</span>
          </div>
        )}

        {submitError && (
          <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="ada-lovelace"
              aria-invalid={Boolean(errors.username)}
              {...register('username')}
            />
            <FieldError message={errors.username?.message} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 10 characters"
                aria-invalid={Boolean(errors.password)}
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-tertiary transition-colors hover:text-text"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
            {!errors.password && (
              <p className="mt-1.5 text-xs text-text-tertiary">
                At least 10 characters with an uppercase letter, a lowercase letter and a number.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Create account
          </Button>
        </form>

        {providers?.google && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => window.location.assign('/api/v1/auth/google')}
            >
              <Chrome className="size-4" aria-hidden />
              Continue with Google
            </Button>
          </>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-text-tertiary">
        Free forever. Your progress, achievements and labs are saved to your Suraksha profile.
      </p>
    </div>
  );
}
