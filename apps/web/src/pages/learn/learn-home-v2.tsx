import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, CheckCircle2, LockKeyhole, Route } from 'lucide-react';
import type { LearningPath } from '@suraksha/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { qk } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Progress, Skeleton } from '@/components/ui/card';

function PathCard({ path, index, signedIn, recommended }: { path: LearningPath; index: number; signedIn: boolean; recommended: boolean }) {
  const total = path.lessonCount ?? 0;
  const done = path.completedLessonCount ?? 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;
  return (
    <Link to={`/learn/${path.slug}`} className={`group relative grid gap-5 rounded-xl border p-5 transition-colors sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:p-6 ${recommended ? 'border-accent/50 bg-accent-subtle/35' : 'border-border bg-surface hover:border-border-strong'}`}>
      <span className="flex size-14 items-center justify-center rounded-xl border border-border bg-bg font-mono text-xl font-bold text-accent">{String(path.levelNumber).padStart(2, '0')}</span>
      <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><strong className="text-lg text-text group-hover:text-accent">{path.name}</strong>{recommended && <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent-foreground">Continue here</span>}{complete && <CheckCircle2 className="size-4 text-success" aria-label="Complete" />}</span><span className="mt-2 block max-w-2xl text-sm leading-relaxed text-text-secondary">{path.description}</span>{signedIn && total > 0 && <span className="mt-4 block max-w-md"><span className="mb-2 flex justify-between font-mono text-[11px] text-text-tertiary"><span>{done} of {total} lessons</span><span>{progress}%</span></span><Progress value={progress} label={`${path.name} progress`} /></span>}</span>
      <span className="flex items-center gap-2 text-sm font-semibold text-text-secondary group-hover:text-accent">{signedIn ? progress > 0 ? 'Continue' : 'Open path' : 'Preview'}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
      {index < 5 && <span className="absolute -bottom-5 left-[3.15rem] h-5 w-px bg-border sm:left-[3.7rem]" aria-hidden />}
    </Link>
  );
}

export default function LearnHomeV2() {
  const { user, loading: authLoading } = useAuth();
  const pathsQuery = useQuery({ queryKey: qk.paths, queryFn: () => api<{ paths: LearningPath[] }>('/learn/paths') });
  const paths = useMemo(() => (pathsQuery.data?.paths ?? []).filter((path) => path.published).sort((a, b) => a.levelNumber - b.levelNumber), [pathsQuery.data]);
  const recommendedIndex = Math.max(0, paths.findIndex((path) => (path.completedLessonCount ?? 0) < (path.lessonCount ?? 0)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="signal-label"><Route className="size-3.5" /> Structured curriculum</p><h1 className="page-title mt-4">Your route to cybersecurity competency</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">Start with how systems work. Each level adds one layer until you can investigate and report vulnerabilities responsibly.</p></div>
        {user && paths[recommendedIndex] && <Link to={`/learn/${paths[recommendedIndex].slug}`}><Button>Continue Level {paths[recommendedIndex].levelNumber}<ArrowRight className="size-4" /></Button></Link>}
      </header>

      {!user && !authLoading && <section className="signal-panel mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Preview every path without an account.</p><p className="mt-1 text-sm text-text-secondary">Create one when you want progress tracking, XP, and a daily plan.</p></div><Link to="/signup"><Button size="sm">Create workspace</Button></Link></section>}

      {pathsQuery.isLoading ? <div className="mt-9 space-y-5">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div> : pathsQuery.isError ? <div className="mt-10"><ErrorState title="The curriculum did not load" description="Check your connection, then try again." action={<Button variant="outline" onClick={() => void pathsQuery.refetch()}>Try again</Button>} /></div> : paths.length === 0 ? <div className="mt-10"><EmptyState icon={BookOpen} title="No paths are published yet" description="The curriculum is being prepared." /></div> : (
        <section className="mt-10" aria-label="Learning route"><div className="mb-5 flex items-center justify-between"><p className="signal-label">Six connected levels</p><span className="hidden items-center gap-1.5 text-xs text-text-tertiary sm:flex"><LockKeyhole className="size-3.5" />You can preview every level</span></div><ol className="space-y-5">{paths.map((path, index) => <li key={path.id}><PathCard path={path} index={index} signedIn={Boolean(user)} recommended={Boolean(user) && index === recommendedIndex} /></li>)}</ol></section>
      )}
    </div>
  );
}
