import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Clock, LogIn } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';
import { Badge, ErrorState, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatMinutes, formatXp } from '@/lib/utils';
import type { LessonDetail } from '@suraksha/shared';
import { ContentBlockRenderer, LabRefCard, slugify } from '@/features/learning/content-blocks';

export default function LessonPage() {
  const { pathSlug = '', lessonSlug = '' } = useParams<{ pathSlug: string; lessonSlug: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const lessonQuery = useQuery({
    queryKey: qk.lesson(lessonSlug),
    queryFn: () => api<LessonDetail>(`/learn/lessons/${lessonSlug}`),
    enabled: !!lessonSlug,
  });
  const lesson = lessonQuery.data;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonSlug]);

  const activeSlug = lesson?.slug;
  useEffect(() => {
    if (!activeSlug || !user) return;
    void api(`/learn/lessons/${activeSlug}/view`, { method: 'POST' }).catch(() => {});
    void api(`/learn/lessons/${activeSlug}/start`, { method: 'POST' }).catch(() => {});
  }, [activeSlug, user]);

  const invalidateProgress = () => {
    void queryClient.invalidateQueries({ queryKey: qk.lesson(lessonSlug) });
    void queryClient.invalidateQueries({ queryKey: qk.path(pathSlug) });
    void queryClient.invalidateQueries({ queryKey: qk.paths });
    void queryClient.invalidateQueries({ queryKey: qk.continue });
    void queryClient.invalidateQueries({ queryKey: qk.dashboard });
    void queryClient.invalidateQueries({ queryKey: qk.me });
    void queryClient.invalidateQueries({ queryKey: qk.myAchievements });
  };

  const complete = useMutation({
    mutationFn: () =>
      api<{ firstCompletion: boolean; xpAwarded: number }>(`/learn/lessons/${lessonSlug}/complete`, {
        method: 'POST',
      }),
    onSuccess: (res) => {
      if (res.firstCompletion && res.xpAwarded > 0) {
        toast('success', `+${formatXp(res.xpAwarded)} XP`, `â€œ${lesson?.title ?? 'Lesson'}â€ completed`);
      }
      invalidateProgress();
    },
    onError: () => toast('error', 'Could not mark as complete', 'Please try again.'),
  });

  if (lessonQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-4">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-3 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (lessonQuery.isError || !lesson) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <ErrorState
          title="Could not load this lesson"
          description="It may not exist, or the connection failed."
          action={
            <Button variant="outline" onClick={() => lessonQuery.refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const completed = lesson.progress.completed;
  const headings = lesson.blocks.filter((b) => b.type === 'heading');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn('mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 xl:max-w-5xl xl:grid xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-10 lg:px-10', !completed && user && 'pb-28')}
      >
        <article className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-text-tertiary">
            <Link to={`/learn/${lesson.pathSlug}`} className="transition-colors hover:text-accent">
              {lesson.pathName}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <span>{lesson.moduleTitle}</span>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <span aria-current="page" className="truncate font-medium text-text-secondary">
              {lesson.title}
            </span>
          </nav>

          <header className="mt-5">
            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-[2.1rem]">{lesson.title}</h1>
            {lesson.summary && (
              <p className="mt-3 text-base leading-relaxed text-text-secondary">{lesson.summary}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-tertiary">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden />
                {formatMinutes(lesson.estimatedMinutes)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="size-3.5" aria-hidden />
                {lesson.moduleTitle}
              </span>
              <Badge variant="accent" className="tracking-widest">
                Level {lesson.levelNumber}
              </Badge>
              {lesson.importance === 'essential' && (
                <span className="inline-flex items-center rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
                  Must know
                </span>
              )}
              {lesson.importance === 'optional' && (
                <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Optional — skip if rushing
                </span>
              )}
              {completed && (
                <Badge variant="success">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Completed
                </Badge>
              )}
            </div>
          </header>

          <div className="mt-10">
            {lesson.blocks.map((block, i) => (
              <ContentBlockRenderer
                key={`${block.type}-${i}`}
                block={block}
                context={{
                  exercises: lesson.exercises,
                  relatedLabs: lesson.relatedLabs,
                  pathSlug: lesson.pathSlug,
                  onExerciseCompleted: invalidateProgress,
                }}
              />
            ))}
          </div>

          {!user ? (
            <section className="mt-12 flex flex-col gap-3 rounded-lg border border-accent/25 bg-accent-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text">Sign in to track your progress and earn XP for this lesson.</p>
              <Link to="/signup" state={{ from: location.pathname }} className="shrink-0">
                <Button size="sm">
                  <LogIn className="size-4" aria-hidden />
                  Sign in to track progress
                </Button>
              </Link>
            </section>
          ) : completed ? (
            <section aria-label="What's next" className="mt-14 rounded-lg border border-border bg-surface p-6 sm:p-7">
              <p className="micro-label">What's next</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-text">Keep the momentum going</h2>
              {lesson.nextLesson && (
                <Link to={`/learn/${lesson.pathSlug}/${lesson.nextLesson.slug}`} className="mt-5 inline-flex w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Next: {lesson.nextLesson.title}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              )}
              {lesson.relatedLabs.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-text-secondary">Practice in a lab</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {lesson.relatedLabs.slice(0, 4).map((lab) => (
                      <LabRefCard key={lab.slug} labSlug={lab.slug} related={lab} compact />
                    ))}
                  </div>
                </div>
              )}
              <Link
                to={`/learn/${lesson.pathSlug}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back to {lesson.pathName}
              </Link>
            </section>
          ) : null}

          {(lesson.prevLesson || lesson.nextLesson) && (
            <nav aria-label="Lesson pagination" className="mt-12 grid gap-3 pb-4 sm:grid-cols-2">
              {lesson.prevLesson ? (
                <Link
                  to={`/learn/${lesson.pathSlug}/${lesson.prevLesson.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-all hover:border-border-strong hover:shadow-md"
                >
                  <ArrowLeft className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:-translate-x-0.5 group-hover:text-accent" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-text-tertiary">Previous</span>
                    <span className="block truncate text-sm font-medium text-text group-hover:text-accent">
                      {lesson.prevLesson.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {lesson.nextLesson && (
                <Link
                  to={`/learn/${lesson.pathSlug}/${lesson.nextLesson.slug}`}
                  className="group flex items-center justify-end gap-3 rounded-lg border border-border bg-surface p-4 text-right transition-all hover:border-border-strong hover:shadow-md"
                >
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-text-tertiary">Next</span>
                    <span className="block truncate text-sm font-medium text-text group-hover:text-accent">
                      {lesson.nextLesson.title}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                </Link>
              )}
            </nav>
          )}
        </article>

        <aside className="mt-12 hidden xl:block">
          <div className="sticky top-24 space-y-5">
            <section aria-label="Lesson details" className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold tracking-tight text-text">Lesson details</h2>
              <ul className="mt-3 space-y-2.5 text-sm text-text-secondary">
                <li className="flex items-center gap-2.5">
                  <Clock className="size-3.5 shrink-0 text-text-tertiary" aria-hidden />
                  {formatMinutes(lesson.estimatedMinutes)}
                </li>
                <li className="flex items-center gap-2.5">
                  <BookOpen className="size-3.5 shrink-0 text-text-tertiary" aria-hidden />
                  <span className="truncate">{lesson.moduleTitle}</span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Badge variant="accent" className="tracking-widest">
                  Level {lesson.levelNumber}
                </Badge>
                {completed ? (
                  <Badge variant="success">
                    <CheckCircle2 className="size-3" aria-hidden />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline">{lesson.progress.started ? 'In progress' : 'Not started'}</Badge>
                )}
              </div>
              {headings.length > 0 && (
                <>
                  <p className="micro-label mt-5">On this page</p>
                  <ul className="mt-2.5 space-y-1.5 border-l border-border pl-3">
                    {headings.slice(0, 8).map((h, i) =>
                      h.type === 'heading' ? (
                        <li key={i}>
                          <a
                            href={`#${slugify(h.text)}`}
                            className="block truncate text-xs leading-5 text-text-tertiary transition-colors hover:text-accent"
                          >
                            {h.text}
                          </a>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </>
              )}
            </section>

            {lesson.relatedLabs.length > 0 && (
              <section aria-label="Related labs" className="rounded-lg border border-border bg-surface p-4">
                <h2 className="text-sm font-semibold tracking-tight text-text">Related labs</h2>
                <div className="mt-3 space-y-2">
                  {lesson.relatedLabs.slice(0, 4).map((lab) => (
                    <LabRefCard key={lab.slug} labSlug={lab.slug} related={lab} compact />
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </motion.div>

      {user && !completed && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">Finished reading?</p>
              <p className="text-xs text-text-tertiary">Mark this lesson complete to track progress.</p>
            </div>
            <Button onClick={() => complete.mutate()} loading={complete.isPending} className="shrink-0">
              Mark as complete
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
