import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Flag,
  Lightbulb,
  ListChecks,
  Lock,
  Package,
  Share2,
  ShieldCheck,
  Target,
  TimerReset,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useSeo } from '@/lib/seo';
import { cn, formatDuration, formatMinutes, formatXp } from '@/lib/utils';
import { Badge, DifficultyDot, Card, CardContent, EmptyState, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { AchievementMedallion } from '@/features/achievements/achievement-icon';
import type { FlagSubmitResult, LabDetail as LabDetailType } from '@suraksha/shared';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/* ------------------------------ Run this lab ------------------------------- */

function RunLabCard({ lab }: { lab: LabDetailType }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const startAttempt = useMutation({
    mutationFn: () => api<{ attemptId: string }>(`/labs/${lab.slug}/start`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.lab(lab.slug) }),
  });

  async function handleDownload() {
    setDownloading(true);
    try {
      if (!user) {
        navigate('/signup', { state: { from: location.pathname } });
        return;
      }
      if (!lab.attempt) await startAttempt.mutateAsync();
      const res = await fetch(`/api/v1/labs/${lab.slug}/download`, { credentials: 'include' });
      if (!res.ok) {
        // The API answers with a JSON error envelope; surface its message
        // instead of a generic retry hint, which hides real causes such as a
        // package that was never uploaded.
        const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
        throw new ApiError(
          res.status,
          body?.error?.code ?? 'UNKNOWN',
          body?.error?.message ?? `Download failed (HTTP ${res.status}).`,
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lab.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('success', 'Lab package downloaded', 'Extract the archive and follow the setup instructions below.');
    } catch (err) {
      toast(
        'error',
        'Could not download lab package',
        err instanceof Error && err.message ? err.message : 'Please try again in a moment.',
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold tracking-tight text-text">
            <Package className="size-4 text-accent" aria-hidden />
            Run this lab
          </h2>
          <Badge variant="outline">v{lab.packageVersion}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-lg bg-surface-2 px-3.5 py-3 text-xs">
          <dt className="text-text-tertiary">Package size</dt>
          <dd className="text-right font-medium tabular-nums text-text">{formatSize(lab.packageSizeBytes)}</dd>
          <dt className="text-text-tertiary">Estimated time</dt>
          <dd className="text-right font-medium text-text">{formatMinutes(lab.estimatedMinutes)}</dd>
          <dt className="text-text-tertiary">Reward</dt>
          <dd className="text-right font-medium text-accent">+{formatXp(lab.xpReward)} XP</dd>
        </dl>

        <Button className="w-full" loading={downloading || startAttempt.isPending} onClick={() => void handleDownload()}>
          {!downloading && !startAttempt.isPending && <Download className="size-4" aria-hidden />}
          Download lab package
        </Button>
        <p className="text-center text-xs text-text-tertiary">
          Runs locally on your machine. Nothing is executed on our servers.
        </p>

        {lab.setupInstructions && (
          <details className="group mt-1 rounded-lg border border-border bg-surface-2 open:pb-1">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
              Setup instructions
              <ChevronDown className="size-4 text-text-tertiary transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <pre className="whitespace-pre-wrap border-t border-border px-3.5 py-3 font-mono text-xs leading-relaxed text-text-secondary">
              {lab.setupInstructions}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

/* --------------------------------- Hints ---------------------------------- */

function HintsCard({ lab }: { lab: LabDetailType }) {
  const queryClient = useQueryClient();

  const revealedSorted = useMemo(
    () => (lab.hintsRevealed ?? []).slice().sort((a, b) => a.index - b.index),
    [lab.hintsRevealed],
  );
  const nextIndex = revealedSorted.length > 0 ? revealedSorted[revealedSorted.length - 1].index + 1 : 0;
  const remaining = Math.max(0, lab.hintsTotal - revealedSorted.length);

  const reveal = useMutation({
    mutationFn: (index: number) =>
      api<{ content: string; total: number }>(`/labs/${lab.slug}/hints/${index}/reveal`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.lab(lab.slug) }),
  });

  if (lab.hintsTotal === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold tracking-tight text-text">
            <Lightbulb className="size-4 text-warning" aria-hidden />
            Hints
          </h2>
          <span className="text-xs tabular-nums text-text-tertiary">
            {revealedSorted.length}/{lab.hintsTotal} revealed
          </span>
        </div>

        {revealedSorted.map((hint) => (
          <div key={hint.index} className="rounded-lg border border-border bg-surface-2 px-3.5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-warning">Hint {hint.index + 1}</p>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">{hint.content}</p>
          </div>
        ))}

        {remaining > 0 && (
          <Button
            variant="outline"
            className="w-full"
            disabled={reveal.isPending}
            loading={reveal.isPending}
            onClick={() => reveal.mutate(nextIndex)}
          >
            Reveal hint {nextIndex + 1}
          </Button>
        )}
        <p className="text-xs text-text-tertiary">Hints must be revealed in order and may affect scoring.</p>
      </CardContent>
    </Card>
  );
}

/* ----------------------------- Flag submission ----------------------------- */

const CELEBRATION_EASE = [0.34, 1.56, 0.64, 1] as const;

function CelebrationModal({
  result,
  labTitle,
  onClose,
}: {
  result: FlagSubmitResult;
  labTitle: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();

  const shareUrl = result.shareSlug ? `${window.location.origin}/achievements/${result.shareSlug}` : window.location.href;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`I solved ${labTitle} on Suraksha Labs! +${result.xpAwarded} XP\n${shareUrl}`);
      toast('success', 'Copied to clipboard', 'Paste it anywhere to share your achievement.');
    } catch {
      toast('error', 'Could not copy', 'Copy the link from your browser address bar instead.');
    }
  }

  return (
    <Modal open onClose={onClose} size="md">
      <div className="px-6 py-8 text-center sm:px-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [...CELEBRATION_EASE] }}
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-subtle"
        >
          <Trophy className="size-8 text-success" aria-hidden />
        </motion.div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-text">Lab Completed</h2>
        <p className="mt-1 text-sm text-text-secondary">{labTitle}</p>

        <motion.p
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [...CELEBRATION_EASE] }}
          className="mt-4 text-5xl font-bold tabular-nums tracking-tight text-accent"
        >
          +{formatXp(result.xpAwarded)} XP
        </motion.p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {result.firstAttemptSolve && (
            <Badge variant="success">
              <ShieldCheck className="size-3.5" aria-hidden />
              First attempt solve
            </Badge>
          )}
          {result.percentile !== null && (
            <Badge variant="accent">
              Faster than {result.percentile}% of learners
            </Badge>
          )}
          {result.solveTimeSeconds !== null && (
            <Badge variant="default">
              <TimerReset className="size-3.5" aria-hidden />
              Solved in {formatDuration(result.solveTimeSeconds)}
            </Badge>
          )}
        </div>

        {result.newAchievements.length > 0 && (
          <div className="mt-6 space-y-2.5 rounded-lg border border-border bg-surface-2 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">New achievements</p>
            {result.newAchievements.map((a) => (
              <div key={a.slug} className="flex items-center gap-3">
                <AchievementMedallion icon={a.icon} rarity={a.rarity} size="sm" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-semibold text-text">{a.title}</p>
                  <p className="truncate text-xs capitalize text-text-tertiary">{a.rarity}</p>
                </div>
                <span className="shrink-0 text-xs font-medium tabular-nums text-accent">+{formatXp(a.xpReward)} XP</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:justify-center">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {user && (
            <Link to={`/profile/${user.username}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <User className="size-4" aria-hidden />
                View profile
              </Button>
            </Link>
          )}
          <Button onClick={() => void handleShare()} className="w-full sm:w-auto">
            <Share2 className="size-4" aria-hidden />
            Share achievement
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function FlagSubmissionCard({ lab }: { lab: LabDetailType }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const shake = useAnimationControls();

  const [flag, setFlag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<FlagSubmitResult | null>(null);
  const [showPersonalBest, setShowPersonalBest] = useState(false);

  const submit = useMutation({
    mutationFn: (value: string) =>
      api<FlagSubmitResult>(`/labs/${lab.slug}/submit-flag`, { method: 'POST', body: { flag: value } }),
    onSuccess: async (res) => {
      if (res.correct && !res.alreadySolved) {
        setError(null);
        setCelebration(res);
      } else if (res.correct) {
        setError(null);
        toast(
          'success',
          'Correct',
          res.solveTimeSeconds !== null ? `Personal best time recorded: ${formatDuration(res.solveTimeSeconds)}` : undefined,
        );
      } else {
        setError('Incorrect flag. Keep investigating.');
        setFlag('');
        await shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4, ease: 'easeInOut' } });
      }
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = flag.trim();
    if (!value) return;
    setError(null);
    submit.mutate(value);
  }

  if (!loading && !user) {
    return (
      <Card>
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-surface-3 text-text-tertiary">
            <Lock className="size-5" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-text">Sign in to submit flags</p>
            <p className="mt-1 text-sm text-text-secondary">
              Create a free account to track solves, earn XP, and unlock achievements.
            </p>
          </div>
          <Link to="/login" state={{ from: location.pathname }} className="block">
            <Button className="w-full">Sign in</Button>
          </Link>
          <p className="text-xs text-text-tertiary">
            New here?{' '}
            <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const solvedPanel = (
    <div className="rounded-lg border border-success/30 bg-success-subtle px-4 py-3.5">
      <p className="flex items-center gap-2 text-sm font-semibold text-success">
        <CheckCircle2 className="size-4" aria-hidden />
        Lab completed
      </p>
      {lab.attempt?.completedAt && (
        <p className="mt-1 text-xs text-success/80">
          Solved with {lab.attempt.submissionCount} submission{lab.attempt.submissionCount === 1 ? '' : 's'}
          {lab.attempt.hintsUsed > 0 && <> Â· {lab.attempt.hintsUsed} hint{lab.attempt.hintsUsed === 1 ? '' : 's'} used</>}
        </p>
      )}
      <button
        type="button"
        onClick={() => setShowPersonalBest((s) => !s)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success underline-offset-2 hover:underline"
        aria-expanded={showPersonalBest}
      >
        Submit again (personal best)
        <ChevronDown className={cn('size-3.5 transition-transform', showPersonalBest && 'rotate-180')} aria-hidden />
      </button>
    </div>
  );

  const form = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="flag-input" className="sr-only">
          Flag
        </Label>
        <Input
          id="flag-input"
          placeholder="flag{...}"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden text-sm font-medium text-danger"
          >
            <span className="flex items-center gap-1.5">
              <Flag className="size-3.5 shrink-0" aria-hidden />
              {error}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
      <Button type="submit" className="w-full" loading={submit.isPending} disabled={!flag.trim()}>
        Submit flag
      </Button>
    </form>
  );

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <h2 className="flex items-center gap-2 font-semibold tracking-tight text-text">
            <Flag className="size-4 text-accent" aria-hidden />
            Submit your flag
          </h2>
          {lab.solved && solvedPanel}
          {(!lab.solved || showPersonalBest) && (
            <motion.div animate={shake}>{form}</motion.div>
          )}
        </CardContent>
      </Card>
      {celebration && (
        <CelebrationModal result={celebration} labTitle={lab.title} onClose={() => setCelebration(null)} />
      )}
    </>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function LabDetailPage() {
  const { slug = '' } = useParams();
  const { data: lab, isLoading, isError, error } = useQuery({
    queryKey: qk.lab(slug),
    queryFn: () => api<LabDetailType>(`/labs/${slug}`),
  });

  useSeo(
    lab ? `${lab.title} â€” Suraksha Labs` : 'Lab â€” Suraksha Labs',
    lab?.shortDescription,
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-9 w-2/3 max-w-xl" />
        <Skeleton className="mt-3 h-4 w-40" />
        <div className="mt-10 grid gap-8 xl:grid-cols-3">
          <div className="space-y-3 xl:col-span-2">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !lab) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {notFound ? (
          <EmptyState
            icon={Flag}
            title="Lab not found"
            description="This lab may have been unpublished or the link is incorrect."
            action={
              <Link to="/labs">
                <Button variant="outline">Browse all labs</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="Could not load this lab"
            description="Something went wrong. Check your connection and try again."
            action={
              <Link to="/labs">
                <Button variant="outline">Back to labs</Button>
              </Link>
            }
          />
        )}
      </div>
    );
  }

  const paragraphs = lab.description.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        to="/labs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All labs
      </Link>

      {/*
        Staff-preview warning. Only staff can load a lab that is not published,
        so reaching this branch means the lab is invisible to every learner.
        Without it this page looks exactly like a live lab and an author has no
        way to tell that the publish step never completed.
      */}
      {!lab.visibleToLearners && (
        <div
          role="status"
          className="mt-5 rounded-lg border border-warning/40 bg-warning-subtle px-4 py-3.5"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-warning">
            <Lock className="size-4" aria-hidden />
            Staff preview — learners cannot see this lab
          </p>
          <p className="mt-1 text-xs text-warning/80">
            Status is <span className="font-mono">{lab.status.replace(/_/g, ' ')}</span>. A lab only appears in
            the learner catalogue once its status is <span className="font-mono">published</span>.
          </p>
          <Link to="/admin/labs" className="mt-2 inline-block text-xs font-medium text-warning underline-offset-2 hover:underline">
            Finish the publish workflow in the admin panel
          </Link>
        </div>
      )}

      {/* ------------------------------- Header ------------------------------- */}
      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{lab.category.name}</Badge>
          <DifficultyDot orderIndex={lab.difficulty.orderIndex} label={lab.difficulty.label} className="text-sm [&>span:first-child]:size-2.5" />
          <Badge variant="accent">
            <Zap className="size-3.5" aria-hidden />+{formatXp(lab.xpReward)} XP
          </Badge>
          {lab.solved && <Badge variant="success">Solved</Badge>}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">{lab.title}</h1>

        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-text-tertiary" aria-hidden />
            {formatMinutes(lab.estimatedMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-text-tertiary" aria-hidden />
            {formatXp(lab.solvedByCount)} solved
          </span>
          {lab.inProgress && !lab.solved && (
            <span className="inline-flex items-center gap-1.5 text-accent">
              <BookOpen className="size-4" aria-hidden />
              In progress
            </span>
          )}
        </p>

        <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">{lab.shortDescription}</p>
      </header>

      <div className="mt-10 grid gap-8 xl:grid-cols-3">
        {/* ------------------------------- Main ------------------------------- */}
        <div className="min-w-0 space-y-10 xl:col-span-2">
          <section>
            <h2 className="text-lg font-semibold tracking-tight text-text">About this lab</h2>
            <div className="mt-3 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed text-text-secondary">
                  {p}
                </p>
              ))}
            </div>
          </section>

          {lab.objectives.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-text">
                <Target className="size-4.5 text-accent" aria-hidden />
                Objectives
              </h2>
              <ul className="mt-3 space-y-2">
                {lab.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                    <ListChecks className="mt-0.5 size-4 shrink-0 text-text-tertiary" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {lab.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold tracking-tight text-text">Skills you will practice</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {lab.skills.map((s) => (
                  <li key={s}>
                    <Badge variant="outline" className="bg-surface-2 px-3 py-1 text-xs">
                      {s}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {lab.prerequisites.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold tracking-tight text-text">Prerequisites</h2>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
                {lab.prerequisites.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/labs/${p.slug}`}
                      className="flex items-center gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      {p.solved ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                      ) : (
                        <Lock className="size-4 shrink-0 text-text-tertiary" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{p.title}</span>
                      {!p.solved && <span className="text-xs text-text-tertiary">Recommended first</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {lab.relatedLessons.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold tracking-tight text-text">Related lessons</h2>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
                {lab.relatedLessons.map((lesson) => (
                  <li key={lesson.slug}>
                    <Link
                      to={`/learn/foundations/${lesson.slug}`}
                      className="flex items-center gap-3 bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                      ) : (
                        <BookOpen className="size-4 shrink-0 text-text-tertiary" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{lesson.title}</span>
                      <ChevronDown className="size-4 -rotate-90 shrink-0 text-text-tertiary" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ------------------------------ Sidebar ------------------------------ */}
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <RunLabCard lab={lab} />
          <HintsCard lab={lab} />
          <FlagSubmissionCard lab={lab} />
        </aside>
      </div>
    </div>
  );
}
