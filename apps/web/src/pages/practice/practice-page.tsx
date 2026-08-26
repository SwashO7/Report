import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDashed, ArrowRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { useAuth } from '@/lib/auth';
import { EmptyState, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PracticeItem {
  id: string;
  slug: string;
  title: string;
  instructions: string;
  questionCount: number;
  xpReward: number;
  lessonSlug: string;
  lessonTitle: string;
  moduleTitle: string;
  pathSlug: string;
  pathName: string;
  levelNumber: number;
  completed: boolean;
}

export default function PracticePage() {
  useSeo('Practice — Suraksha Labs', 'Apply what you learn with hands-on practice exercises.');
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: qk.practice,
    queryFn: () => api<{ exercises: PracticeItem[] }>('/learn/exercises'),
  });

  const exercises = data?.exercises ?? [];
  const completedCount = exercises.filter((e) => e.completed).length;
  const groups = new Map<string, PracticeItem[]>();
  for (const ex of exercises) {
    const key = `${ex.levelNumber}|${ex.pathName}|${ex.pathSlug}`;
    const arr = groups.get(key) ?? [];
    arr.push(ex);
    groups.set(key, arr);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) => Number(a[0].split('|')[0]) - Number(b[0].split('|')[0]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
          <p className="mt-2.5 text-base leading-relaxed text-text-secondary">
            Apply concepts in controlled exercises. Short, focused, and checked instantly.
          </p>
        </div>
        {user && exercises.length > 0 && (
          <p className="text-sm tabular-nums text-text-tertiary">
            {completedCount} of {exercises.length} completed
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="mt-7 space-y-px overflow-hidden rounded-lg border border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[64px] w-full rounded-none border-b border-border bg-surface" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No practice exercises yet"
            description="Exercises appear here as the team publishes them. Start with a lesson to learn the concepts first."
            action={
              <Link to="/learn">
                <Button>Browse learning paths</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-9">
          {sortedGroups.map(([key, items]) => {
            const [, pathName, pathSlug] = key.split('|');
            return (
              <section key={key} aria-label={pathName}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="micro-label">{pathName}</h2>
                  <Link
                    to={`/learn/${pathSlug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    Path overview
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  {items.map((ex, i) => (
                    <Link
                      key={ex.id}
                      to={`/learn/${ex.pathSlug}/${ex.lessonSlug}`}
                      className={cn(
                        'group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2 sm:px-5',
                        i > 0 && 'border-t border-border',
                      )}
                    >
                      {ex.completed ? (
                        <CheckCircle2 className="size-[18px] shrink-0 text-success" aria-label="Completed" />
                      ) : (
                        <CircleDashed className="size-[18px] shrink-0 text-text-tertiary/60" aria-label="Not completed" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate text-sm', ex.completed ? 'font-medium text-text-secondary' : 'font-medium text-text group-hover:text-accent')}>
                          {ex.title}
                        </span>
                        <span className="block truncate text-xs text-text-tertiary">
                          {ex.lessonTitle} · {ex.questionCount} question{ex.questionCount === 1 ? '' : 's'}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 text-xs tabular-nums text-text-secondary sm:flex">
                        <Clock className="size-3.5" aria-hidden />
                        +{ex.xpReward} XP
                      </span>
                      <span
                        className={cn(
                          'hidden shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors sm:block',
                          ex.completed
                            ? 'border-border text-text-secondary group-hover:border-border-strong'
                            : 'border-transparent bg-ink text-ink-foreground',
                        )}
                      >
                        {ex.completed ? 'Retry' : 'Start'}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!user && exercises.length > 0 && (
        <div className="mt-10 rounded-lg border border-border bg-surface px-5 py-4 text-center">
          <p className="text-sm text-text-secondary">
            <Link to="/signup" className="font-semibold text-accent hover:text-accent-hover">
              Create a free account
            </Link>{' '}
            to save your practice progress and earn XP.
          </p>
        </div>
      )}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
        <Clock className="size-3.5" aria-hidden />
        Practice is low-stakes by design — hints and retries are always free.
      </p>
    </div>
  );
}
