import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { passwordSchema } from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldError, Input, Label } from '@/components/ui/input';

const resetFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ResetForm = z.infer<typeof resetFormSchema>;

function InvalidLinkState() {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
        <XCircle className="size-6" aria-hidden />
      </div>
      <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">This link is invalid or has expired</h1>
      <p className="mt-2 max-w-xs text-sm text-text-secondary">
        Reset links expire after a short time for security. Request a new one and try again.
      </p>
      <Link to="/forgot-password" className="mt-6 w-full">
        <Button size="lg" className="w-full">
          Request a new link
        </Button>
      </Link>
      <p className="mt-4 text-sm text-text-secondary">
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetFormSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (values: ResetForm) => {
    setSubmitError(null);
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: { token, password: values.password },
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) setSubmitError(err.message);
      else setSubmitError('Something went wrong. Please try again.');
    }
  };

  if (!token || (!success && submitError && submitError.toLowerCase().includes('token'))) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
        <Card className="p-6 sm:p-8">
          <InvalidLinkState />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
      <Card className="p-6 sm:p-8">
        {success ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success-subtle text-success">
              <CheckCircle2 className="size-6" aria-hidden />
            </div>
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">Password updated</h1>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              Your password has been changed. Use your new password to sign in.
            </p>
            <Link to="/login" className="mt-6 w-full">
              <Button size="lg" className="w-full">
                Sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-text">Choose a new password</h1>
            <p className="mt-1.5 text-sm text-text-secondary">Pick something strong you have not used elsewhere.</p>

            {submitError && (
              <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 10 characters"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
                <FieldError message={errors.password?.message} />
                {!errors.password && (
                  <p className="mt-1.5 text-xs text-text-tertiary">
                    Must be at least 10 characters and include an uppercase letter, a lowercase letter and a number.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  {...register('confirmPassword')}
                />
                <FieldError message={errors.confirmPassword?.message} />
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Update password
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
