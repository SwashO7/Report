import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  BookOpen,
  Bug,
  ChevronRight,
  Globe,
  Info,
  Network,
  Search,
  ShieldCheck,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { Badge, EmptyState, ErrorState, Progress, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LearningPath } from '@suraksha/shared';

const PATH_ICONS: Record<string, LucideIcon> = {
  foundations: ShieldCheck,
  linux: Terminal,
  networking: Network,
  web: Globe,
  recon: Search,
  'vulnerability-research': Bug,
};

function pathIcon(slug: string): LucideIcon {
  return PATH_ICONS[slug] ?? BookOpen;
}

function PathCard({ path, signedIn }: { path: LearningPath; signedIn: boolean }) {
  const Icon = pathIcon(path.slug);
  const total = path.lessonCount ?? 0;
  const done = path.completedLessonCount ?? 0;

  return (
    <Link to={`/learn/${path.slug}`} className="group block h-full">
      <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:border-border-strong group-hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="accent" className="tracking-widest">
            Level {path.levelNumber}
          </Badge>
          <span className="text-text-tertiary transition-colors group-hover:text-accent" aria-hidden>
            <Icon className="size-6" />
          </span>
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-text">{path.name}</h2>
        <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-text-secondary">{path.description}</p>
        <div className="mt-5 border-t border-border pt-4">
          {signedIn && total > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>
                  {done}/{total} lessons
                </span>
                <span className="tabular-nums text-text-tertiary">{Math.round((done / total) * 100)}%</span>
              </div>
              <Progress value={total > 0 ? (done / total) * 100 : 0} label={`${path.name} progress`} className="mt-2 h-1.5" />
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors group-hover:text-accent">
              {total > 0 ? `${total} lessons` : 'Explore path'}
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          )}
        </div>
      </article>
    </Link>
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
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">Learning paths</h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          Follow a structured curriculum from fundamentals to advanced research. Each path builds on the last — learn
          the theory, then prove it in hands-on labs.
        </p>
      </header>

      {!user && !authLoading && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-accent/25 bg-accent-subtle px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5 text-sm text-text">
            <Info className="size-4 shrink-0 text-accent" aria-hidden />
            Sign in to track your progress and earn XP.
          </p>
          <Link to="/signup" className="shrink-0">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border bg-surface p-5">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-1/3" />
            </div>
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
          <EmptyState
            icon={BookOpen}
            title="No paths published yet"
            description="New learning paths are on the way. Check back soon."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((p) => (
            <PathCard key={p.id} path={p} signedIn={!!user} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
