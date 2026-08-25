import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { forgotPasswordSchema } from '@suraksha/shared';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldError, Input, Label } from '@/components/ui/input';

type ForgotInput = { email: string };

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (values: ForgotInput) => {
    try {
      await api('/auth/forgot-password', { method: 'POST', body: values });
    } catch {
      /* Intentionally silent — never reveal whether an account exists. */
    } finally {
      setSubmitted(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
      <Card className="p-6 sm:p-8">
        {submitted ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success-subtle text-success">
              <CheckCircle2 className="size-6" aria-hidden />
            </div>
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">Check your inbox</h1>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              If an account exists for that email, a reset link is on its way.
            </p>
            <Link to="/login" className="mt-6 w-full">
              <Button variant="outline" size="lg" className="w-full">
                <ArrowLeft className="size-4" aria-hidden />
                Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent-subtle text-accent">
                <Mail className="size-6" aria-hidden />
              </div>
              <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">Reset your password</h1>
              <p className="mt-2 max-w-xs text-sm text-text-secondary">
                Enter your account email and we will send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
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

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Send reset link
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-text-secondary">
              Remembered it?{' '}
              <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                Sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
