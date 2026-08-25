import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type VerifyPhase = 'loading' | 'success' | 'error';
type ResendState = 'idle' | 'sending' | 'sent' | 'needLogin';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [phase, setPhase] = useState<VerifyPhase | null>(token ? 'loading' : null);
  const [resendState, setResendState] = useState<ResendState>('idle');

  useEffect(() => {
    if (!token) return;
    let active = true;
    api('/auth/verify-email', { method: 'POST', body: { token } })
      .then(() => {
        if (active) setPhase('success');
      })
      .catch(() => {
        if (active) setPhase('error');
      });
    return () => {
      active = false;
    };
  }, [token]);

  const resend = async () => {
    setResendState('sending');
    try {
      await api('/auth/resend-verification', { method: 'POST' });
      setResendState('sent');
    } catch (err) {
      setResendState(err instanceof ApiError && err.status === 401 ? 'needLogin' : 'idle');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-20">
      <Card className="p-6 sm:p-8">
        {phase === 'loading' && (
          <div className="flex flex-col items-center py-6 text-center" aria-live="polite">
            <Loader2 className="size-8 animate-spin text-accent" aria-hidden />
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">Verifying your email</h1>
            <p className="mt-2 text-sm text-text-secondary">This will only take a moment.</p>
          </div>
        )}

        {phase === 'success' && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success-subtle text-success">
              <CheckCircle2 className="size-6" aria-hidden />
            </div>
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">Email verified</h1>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              Your email address is confirmed. You are all set to start training.
            </p>
            <Link to="/dashboard" className="mt-6 w-full">
              <Button size="lg" className="w-full">
                Go to dashboard
              </Button>
            </Link>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
              <XCircle className="size-6" aria-hidden />
            </div>
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">This link is invalid or has expired</h1>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              Verification links expire after a short time. Sign in and request a new verification email.
            </p>
            <Link to="/login" className="mt-6 w-full">
              <Button variant="outline" size="lg" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        )}

        {phase === null && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent-subtle text-accent">
              <Mail className="size-6" aria-hidden />
            </div>
            <h1 className="mt-5 text-xl font-semibold tracking-tight text-text">Check your inbox</h1>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              We sent a verification link to your email address. Click it to activate your account.
            </p>

            <div className="mt-6 w-full" aria-live="polite">
              {resendState === 'needLogin' ? (
                <>
                  <p className="text-sm text-text-secondary">Your session has expired.</p>
                  <Link to="/login" className="mt-3 inline-block font-medium text-accent hover:text-accent-hover">
                    Sign in to resend the email
                  </Link>
                </>
              ) : resendState === 'sent' ? (
                <p className="text-sm font-medium text-success">Verification email sent. Check your inbox.</p>
              ) : (
                <Button variant="outline" size="lg" className="w-full" loading={resendState === 'sending'} onClick={() => void resend()}>
                  Resend verification email
                </Button>
              )}
            </div>

            <p className="mt-5 text-sm text-text-secondary">
              <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                Back to sign in
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
