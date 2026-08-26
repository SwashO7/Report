import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Network, Sprout, Swords } from 'lucide-react';
import type { OnboardingInput } from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ExperienceLevel = OnboardingInput['experienceLevel'];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'none', label: 'Complete beginner', description: "I'm new to cybersecurity and tech", icon: Sprout },
  { value: 'beginner', label: 'Beginner', description: 'I know basic computer concepts', icon: BookOpen },
  { value: 'intermediate', label: 'Intermediate', description: "I'm comfortable with networking or programming", icon: Network },
  { value: 'advanced', label: 'Advanced', description: 'I have hands-on security experience', icon: Swords },
];

const INTEREST_OPTIONS = [
  'Web Security',
  'Networking',
  'Linux',
  'Reconnaissance',
  'Cryptography',
  'Bug Bounty',
  'Malware Analysis',
  'Cloud Security',
] as const;

export default function OnboardingPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name.trim().split(/\s+/)[0];

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((i) => i !== interest) : [...current, interest],
    );
  };

  const finish = async () => {
    if (!experienceLevel || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api('/me/onboarding', {
        method: 'POST',
        body: { experienceLevel, interests },
      });
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <Link to="/" aria-label="Suraksha Labs home" className="flex items-center gap-2.5">
          <img src="/brand/logo-dark.png" alt="" className="size-8 dark:hidden" aria-hidden />
          <img src="/brand/logo-white.png" alt="" className="hidden size-8 dark:block" aria-hidden />
          <span className="text-[15px] font-bold tracking-tight text-text">Suraksha Labs</span>
        </Link>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:py-24">
        <div className="w-full max-w-xl">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Welcome to Suraksha Labs{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Let's personalize your starting point. You can change this anytime in settings.
            </p>
          </header>

          <div className="mt-8 flex items-center gap-4">
            <Progress value={step === 1 ? 50 : 100} label={`Step ${step} of 2`} />
            <p className="shrink-0 text-xs font-medium uppercase tracking-wider text-text-tertiary">
              Step {step} of 2
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {step === 1 ? (
              <motion.section
                key="step-experience"
                aria-label="Experience level"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <h2 className="text-lg font-medium text-text">What's your current experience level?</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Experience level options">
                  {EXPERIENCE_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                    const selected = experienceLevel === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setExperienceLevel(value)}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                          selected
                            ? 'border-accent bg-accent-subtle ring-1 ring-accent'
                            : 'border-border bg-surface hover:border-border-strong hover:bg-surface-2',
                        )}
                      >
                        <Icon
                          className={cn('mt-0.5 size-5 shrink-0', selected ? 'text-accent' : 'text-text-tertiary')}
                          aria-hidden
                        />
                        <span>
                          <span className={cn('block text-sm font-semibold', selected ? 'text-text' : 'text-text')}>
                            {label}
                          </span>
                          <span className="mt-0.5 block text-xs text-text-secondary">{description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="step-interests"
                aria-label="Areas of interest"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <h2 className="text-lg font-medium text-text">What do you want to focus on?</h2>
                <p className="mt-1 text-sm text-text-secondary">Pick as many as you like â€” or skip this step.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                          selected
                            ? 'border-accent bg-accent-subtle text-accent'
                            : 'border-border-strong bg-surface text-text-secondary hover:bg-surface-2 hover:text-text',
                        )}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-sm text-danger"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="outline" disabled={step === 1 || submitting} onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Button>
            {step === 1 ? (
              <Button disabled={!experienceLevel} onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button loading={submitting} onClick={() => void finish()}>
                Finish setup
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
