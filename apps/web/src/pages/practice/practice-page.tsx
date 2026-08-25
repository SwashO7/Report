import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PencilLine, CheckCircle2, CircleDashed, ArrowRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, Badge, EmptyState, Skeleton } from '@/components/ui/card';
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent-subtle text-accent">
            <PencilLine className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
            <p className="text-sm text-text-secondary">
              Apply concepts in controlled exercises. Short, focused, and checked instantly.
            </p>
          </div>
        </div>
        {user && exercises.length > 0 && (
          <p className="mt-4 text-sm text-text-secondary">
            <span className="font-semibold text-text">{completedCount}</span> of{' '}
            <span className="font-semibold text-text">{exercises.length}</span> completed
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={PencilLine}
          title="No practice exercises yet"
          description="Exercises appear here as the team publishes them. Start with a lesson to learn the concepts first."
          action={
            <Link to="/learn" className="text-sm font-medium text-accent hover:underline">
              Browse learning paths
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {sortedGroups.map(([key, items]) => {
            const [, pathName, pathSlug] = key.split('|');
            return (
              <section key={key} aria-label={pathName}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">{pathName}</h2>
                  <Link to={`/learn/${pathSlug}`} className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                    Path overview <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {items.map((ex) => (
                    <Card key={ex.id} className={cn('transition-colors hover:border-border-strong', ex.completed && 'border-success/25')}>
                      <CardContent className="flex items-center gap-4 py-4">
                        {ex.completed ? (
                          <CheckCircle2 className="size-5 shrink-0 text-success" aria-label="Completed" />
                        ) : (
                          <CircleDashed className="size-5 shrink-0 text-text-tertiary" aria-label="Not completed" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-text">{ex.title}</p>
                          <p className="truncate text-sm text-text-secondary">
                            {ex.lessonTitle} · {ex.questionCount} question{ex.questionCount === 1 ? '' : 's'}
                          </p>
                        </div>
                        <Badge variant="accent" className="shrink-0">+{ex.xpReward} XP</Badge>
                        <Link
                          to={`/learn/${ex.pathSlug}/${ex.lessonSlug}`}
                          className="shrink-0 rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                        >
                          {ex.completed ? 'Retry' : 'Start'}
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!user && exercises.length > 0 && (
        <div className="mt-10 rounded-xl border border-border bg-surface-2 p-5 text-center">
          <p className="text-sm text-text-secondary">
            <Link to="/signup" className="font-semibold text-accent hover:underline">
              Create a free account
            </Link>{' '}
            to save your practice progress and earn XP.
          </p>
        </div>
      )}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
        <Clock className="size-3.5" aria-hidden />
        Practice is unchecked exploration — hints and retries are always free.
      </p>
    </div>
  );
}
