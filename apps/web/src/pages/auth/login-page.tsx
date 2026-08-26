import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Chrome } from 'lucide-react';
import { loginSchema, type LoginInput } from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth, homeForRole } from '@/lib/auth';
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

export default function LoginPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const { data: providers } = useQuery({
    queryKey: ['auth', 'providers'],
    queryFn: () => api<{ google: boolean }>('/auth/providers'),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const onSubmit = async (values: LoginInput) => {
    setSubmitError(null);
    try {
      const res = await api<{ user: { role: string } }>('/auth/login', { method: 'POST', body: values });
      await refresh();
      const from = (location.state as { from?: string } | null)?.from;
      // Staff land directly in the admin console; learners continue their journey.
      navigate(from ?? homeForRole(res.user.role));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setSubmitError('Incorrect email or password.');
        else if (err.status === 403) setSubmitError('This account is suspended. Contact support if you believe this is a mistake.');
        else setSubmitError(err.message);
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
        <h1 className="text-2xl font-semibold tracking-tight text-text">Welcome back</h1>
        <p className="mt-1.5 text-sm text-text-secondary">Sign in to continue your training.</p>

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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="mb-1.5 text-xs font-medium text-accent hover:text-accent-hover">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Sign in
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
        New to Suraksha Labs?{' '}
        <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
          Create an account
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-text-tertiary">
        Your progress, achievements and labs are saved to your Suraksha profile.
      </p>
    </div>
  );
}
