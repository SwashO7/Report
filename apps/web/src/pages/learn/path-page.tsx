import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  PlayCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { Badge, ErrorState, Progress, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatMinutes } from '@/lib/utils';
import type { LessonSummary, ModuleSummary, PathDetail } from '@suraksha/shared';

function LessonRow({
  lesson,
  pathSlug,
  signedIn,
}: {
  lesson: LessonSummary;
  pathSlug: string;
  signedIn: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const open = () => {
    if (signedIn) {
      navigate(`/learn/${pathSlug}/${lesson.slug}`);
    } else {
      navigate('/signup', { state: { from: location.pathname } });
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:gap-4 sm:px-5"
    >
      <span aria-hidden className="shrink-0">
        {lesson.completed ? (
          <CheckCircle2 className="size-5 text-success" />
        ) : lesson.started ? (
          <PlayCircle className="size-5 text-accent" />
        ) : (
          <Circle className="size-5 text-text-tertiary/50" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-sm',
            lesson.completed ? 'font-medium text-text-secondary' : 'font-medium text-text',
          )}
        >
          {lesson.title}
        </span>
        {lesson.summary && (
          <span className="mt-0.5 hidden truncate text-xs text-text-tertiary sm:block">{lesson.summary}</span>
        )}
      </span>
      <span className="hidden shrink-0 items-center gap-3 md:flex" aria-hidden>
        {(lesson.hasVideo || lesson.hasPractice) && (
          <span className="flex items-center gap-1.5" title={[lesson.hasVideo && 'Video', lesson.hasPractice && 'Practice'].filter(Boolean).join(' + ')}>
            {lesson.hasVideo && <span className="size-1.5 rounded-full bg-accent" />}
            {lesson.hasPractice && <span className="size-1.5 rounded-full bg-success" />}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-text-tertiary">
          <Clock className="size-3.5" />
          {formatMinutes(lesson.estimatedMinutes)}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-text-tertiary/70" aria-hidden />
    </button>
  );
}

export default function PathPage() {
  const { pathSlug = '' } = useParams<{ pathSlug: string }>();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.path(pathSlug),
    queryFn: () => api<PathDetail>(`/learn/paths/${pathSlug}`),
    enabled: !!pathSlug,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathSlug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        {[0, 1].map((m) => (
          <section key={m} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-4xl py-16">
        <ErrorState
          title="Could not load this path"
          description="It may not exist, or the connection failed."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const modules: ModuleSummary[] = [...data.modules].sort((a, b) => a.orderIndex - b.orderIndex);
  const allLessons = modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => l.completed).length;
  const totalCount = allLessons.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10"
    >
      <Link
        to="/learn"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All paths
      </Link>

      <header className="mt-6 max-w-2xl">
        <Badge variant="accent" className="tracking-widest">
          Level {data.levelNumber}
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">{data.name}</h1>
        {data.description && (
          <p className="mt-3 text-base leading-relaxed text-text-secondary">{data.description}</p>
        )}
      </header>

      {user && totalCount > 0 && (
        <section aria-label="Path progress" className="mt-7 rounded-lg border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-text-secondary">
              <span className="font-semibold text-text">{completedCount}</span> of{' '}
              <span className="font-semibold text-text">{totalCount}</span> lessons completed
            </span>
            <span className="font-semibold tabular-nums text-text">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>
          <Progress value={(completedCount / totalCount) * 100} label={`${data.name} progress`} className="mt-3" />
        </section>
      )}

      <div className="mt-10 space-y-10">
        {modules.map((module) => {
          const moduleCompleted = module.lessons.filter((l) => l.completed).length;
          return (
            <section key={module.id} aria-label={module.title}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-text">{module.title}</h2>
                <span className="text-xs tabular-nums text-text-tertiary">
                  {moduleCompleted}/{module.lessons.length}
                </span>
              </div>
              {module.description && (
                <p className="mt-1 text-sm leading-relaxed text-text-tertiary">{module.description}</p>
              )}
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                {[...module.lessons]
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} pathSlug={data.slug} signedIn={!!user} />
                  ))}
              </div>
            </section>
          );
        })}
      </div>
    </motion.div>
  );
}
