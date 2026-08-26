import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { EmptyState, ErrorState, Progress, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LearningPath } from '@suraksha/shared';

function PathRow({ path, signedIn, first }: { path: LearningPath; signedIn: boolean; first: boolean }) {
  const total = path.lessonCount ?? 0;
  const done = path.completedLessonCount ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <li className={first ? '' : 'border-t border-border'}>
      <Link
        to={`/learn/${path.slug}`}
        className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-8 sm:px-6"
      >
        {/* Level block */}
        <span className="flex shrink-0 items-center gap-4 sm:w-40">
          <span className="flex size-12 shrink-0 items-center justify-center border border-border bg-bg font-mono text-lg font-bold tabular-nums text-text transition-colors group-hover:border-accent group-hover:text-accent">
            {path.levelNumber}
          </span>
          <span className="min-w-0 sm:hidden">
            <span className="block truncate text-[15px] font-semibold text-text">{path.name}</span>
          </span>
        </span>

        <span className="hidden min-w-0 flex-1 sm:block">
          <span className="block text-[15px] font-semibold text-text transition-colors group-hover:text-accent">{path.name}</span>
          <span className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-text-secondary">{path.description}</span>
        </span>

        <span className="shrink-0 sm:w-44">
          {signedIn && total > 0 ? (
            <>
              <span className="mb-1.5 flex items-center justify-between text-xs tabular-nums text-text-secondary">
                <span>
                  {done}/{total} lessons
                </span>
                <span>{pct}%</span>
              </span>
              <Progress value={pct} label={`${path.name} progress`} />
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors group-hover:text-accent">
              {total > 0 ? `${total} lessons` : 'Explore path'}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          )}
        </span>
      </Link>
      {/* Mobile description */}
      <p className="-mt-3 px-5 pb-5 text-sm leading-relaxed text-text-secondary sm:hidden">{path.description}</p>
    </li>
  );
}

export default function LearnHomePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.paths,
    queryFn: () => api<{ paths: LearningPath[] }>('/learn/paths'),
  });

  const paths = useMemo(() => (data?.paths ?? []).filter((p) => p.published), [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl"
    >
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Learning paths</h1>
        <p className="mt-2.5 text-base leading-relaxed text-text-secondary">
          A structured curriculum from fundamentals to advanced research. Each path builds on the last — learn the
          concepts, then prove them in hands-on labs.
        </p>
      </header>

      {!user && !authLoading && (
        <div className="mt-7 flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5 text-sm text-text-secondary">
            <Info className="size-4 shrink-0 text-accent" aria-hidden />
            Sign in to track your progress and earn XP.
          </p>
          <Link to="/signup" className="shrink-0">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 space-y-px overflow-hidden rounded-lg border border-border bg-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-none border-b border-border bg-surface" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-10">
          <ErrorState
            title="Could not load learning paths"
            description="Check your connection and try again."
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : paths.length === 0 ? (
        <div className="mt-10">
          <EmptyState icon={BookOpen} title="No paths published yet" description="New learning paths are on the way. Check back soon." />
        </div>
      ) : (
        <ol className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
          {paths.map((p, i) => (
            <PathRow key={p.id} path={p} signedIn={!!user} first={i === 0} />
          ))}
        </ol>
      )}
    </motion.div>
  );
}
