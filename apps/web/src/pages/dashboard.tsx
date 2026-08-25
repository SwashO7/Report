import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Bug,
  Clock,
  Crown,
  Eye,
  Flag,
  Flame,
  Fingerprint,
  KeyRound,
  Lock,
  Medal,
  Play,
  Rocket,
  Shield,
  Star,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Unlock,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { Avatar, Badge, ErrorState, Progress, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatMinutes, formatXp, timeAgo } from '@/lib/utils';
import type { LessonDetail, UserAchievementPublic, XpProgress } from '@suraksha/shared';
import { difficultyBadgeVariant } from '@/features/learning/content-blocks';

interface DashboardData {
  xp: XpProgress;
  continueLesson: { slug: string; title: string; moduleTitle: string; estimatedMinutes: number } | null;
  stats: {
    labsSolved: number;
    lessonsCompleted: number;
    achievements: number;
    globalRank: number | null;
    firstAttemptRate: number;
    avgSolveMinutes: number;
  };
  recentAchievements: UserAchievementPublic[];
  recommendedLab: {
    slug: string;
    title: string;
    shortDescription: string;
    difficultyLabel: string;
    xpReward: number;
    estimatedMinutes: number;
  } | null;
  recentActivity: { kind: string; title: string; at: string; link: string }[];
  rankEntries: { username: string; name: string; avatarUrl: string | null; xp: number }[];
}

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  flame: Flame,
  zap: Zap,
  target: Target,
  trophy: Trophy,
  medal: Medal,
  star: Star,
  crown: Crown,
  terminal: Terminal,
  bug: Bug,
  lock: Lock,
  unlock: Unlock,
  key: KeyRound,
  brain: Brain,
  rocket: Rocket,
  eye: Eye,
  fingerprint: Fingerprint,
  flag: Flag,
  book: BookOpen,
  award: Award,
};

function AchievementIcon({ name }: { name: string }) {
  const Icon = ACHIEVEMENT_ICONS[name.toLowerCase()] ?? Award;
  return <Icon className="size-5" aria-hidden />;
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <div className="flex items-center gap-1.5 text-text-tertiary">
        <Icon className="size-3.5" aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-text">{value}</p>
    </div>
  );
}

function activityKindIcon(kind: string): LucideIcon {
  const k = kind.toLowerCase();
  if (k.includes('lesson') || k.includes('learn')) return BookOpen;
  if (k.includes('lab') || k.includes('flag')) return Flag;
  if (k.includes('achievement')) return Award;
  if (k.includes('level') || k.includes('rank') || k.includes('xp')) return TrendingUp;
  if (k.includes('streak')) return Flame;
  return Activity;
}

function ContinueHero({ data }: { data: DashboardData }) {
  const continueLesson = data.continueLesson;
  const detail = useQuery({
    queryKey: continueLesson ? qk.lesson(continueLesson.slug) : ['learn', 'lesson', 'none'],
    queryFn: () => api<LessonDetail>(`/learn/lessons/${continueLesson!.slug}`),
    enabled: !!continueLesson,
    staleTime: 60_000,
  });

  if (!continueLesson) {
    return (
      <section className="hero-texture rounded-xl border border-border bg-surface p-6 shadow-xs sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Get started</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-[1.7rem]">
          Start your security journey
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
          Work through structured learning paths and build real skills lesson by lesson.
        </p>
        <Link to="/learn" className="mt-6 inline-flex">
          <Button size="lg">
            Start Level 0
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </Link>
      </section>
    );
  }

  const resumeHref = detail.data ? `/learn/${detail.data.pathSlug}/${detail.data.slug}` : '/learn';

  return (
    <section className="hero-texture rounded-xl border border-border bg-surface p-6 shadow-xs sm:p-8">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
          <span className="relative inline-flex size-2 rounded-full bg-accent" />
        </span>
        Continue learning
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-[1.7rem]">{continueLesson.title}</h2>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
        <span>{continueLesson.moduleTitle}</span>
        <span className="inline-flex items-center gap-1.5 text-text-tertiary">
          <Clock className="size-3.5" aria-hidden />
          {formatMinutes(continueLesson.estimatedMinutes)}
        </span>
      </p>
      <Link to={resumeHref} className="mt-6 inline-flex">
        <Button size="lg">
          <Play className="size-4 fill-current" aria-hidden />
          Resume lesson
        </Button>
      </Link>
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.dashboard,
    queryFn: () => api<DashboardData>('/dashboard'),
  });

  const firstName = user?.name.split(' ')[0] ?? 'there';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-6xl py-16">
        <ErrorState
          title="Could not load your dashboard"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const { xp, stats } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl"
    >
      <header className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-text">Good to see you, {firstName}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">Pick up where you left off, or explore something new.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <main className="space-y-6 lg:col-span-2">
          <ContinueHero data={data} />

          <section aria-label="Your stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Flag} label="Labs solved" value={formatXp(stats.labsSolved)} />
            <StatCard icon={BookOpen} label="Lessons done" value={formatXp(stats.lessonsCompleted)} />
            <StatCard icon={Award} label="Achievements" value={formatXp(stats.achievements)} />
            <StatCard icon={TrendingUp} label="Global rank" value={stats.globalRank != null ? `#${formatXp(stats.globalRank)}` : '—'} />
          </section>

          {data.recommendedLab && (
            <section
              aria-label="Recommended lab"
              className="rounded-xl border border-border bg-surface p-5 shadow-xs"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Recommended for you</p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold tracking-tight text-text">
                    {data.recommendedLab.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                    {data.recommendedLab.shortDescription}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant={difficultyBadgeVariant(data.recommendedLab.difficultyLabel)}>
                      {data.recommendedLab.difficultyLabel}
                    </Badge>
                    <Badge variant="accent">+{formatXp(data.recommendedLab.xpReward)} XP</Badge>
                    <span className="ml-1 inline-flex items-center gap-1 text-xs text-text-tertiary">
                      <Clock className="size-3.5" aria-hidden />
                      {formatMinutes(data.recommendedLab.estimatedMinutes)}
                    </span>
                  </div>
                </div>
                <Link to={`/labs/${data.recommendedLab.slug}`} className="shrink-0">
                  <Button className="w-full sm:w-auto">
                    Start lab
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              </div>
            </section>
          )}

          <section aria-label="Recent activity" className="rounded-xl border border-border bg-surface shadow-xs">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight text-text">Recent activity</h2>
            </div>
            {data.recentActivity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-text-tertiary">
                No activity yet — complete a lesson or solve a lab to get started.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentActivity.slice(0, 8).map((item, i) => {
                  const Icon = activityKindIcon(item.kind);
                  const body = (
                    <>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-secondary">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-text">{item.title}</span>
                      <span className="shrink-0 text-xs text-text-tertiary">{timeAgo(item.at)}</span>
                    </>
                  );
                  const rowClass = 'flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2';
                  return (
                    <li key={i}>
                      {item.link ? (
                        <Link to={item.link} className={cn(rowClass, 'block')}>
                          {body}
                        </Link>
                      ) : (
                        <div className={rowClass}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </main>

        <aside className="space-y-6">
          <section aria-label="XP progress" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Level</p>
                <p className="mt-1 font-semibold tracking-tight text-text">
                  {xp.level ? `Level ${xp.level.order} — ${xp.level.name}` : 'Unranked'}
                </p>
                {xp.level && <p className="text-xs text-text-tertiary">{xp.level.title}</p>}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums tracking-tight text-text">{formatXp(xp.xp)}</p>
                <p className="text-xs text-text-tertiary">total XP</p>
              </div>
            </div>
            <Progress value={xp.progressPercent} label="Level progress" className="mt-4" />
            <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-text-tertiary">
              <span>{formatXp(xp.levelStartXp)} XP</span>
              {xp.nextLevelXp != null && <span>{formatXp(xp.nextLevelXp)} XP</span>}
            </div>
            <p className="mt-3 text-sm">
              {xp.nextLevel && xp.xpToNextLevel != null ? (
                <>
                  <span className="font-semibold text-accent">{formatXp(xp.xpToNextLevel)} XP</span>
                  <span className="text-text-secondary"> to {xp.nextLevel.title}</span>
                </>
              ) : (
                <span className="font-medium text-success">Maximum level reached</span>
              )}
            </p>
          </section>

          <section aria-label="Recent achievements" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="text-base font-semibold tracking-tight text-text">Recent achievements</h2>
            {data.recentAchievements.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-text-tertiary">
                Unlock achievements by completing lessons and solving labs.
              </p>
            ) : (
              <ul className="mt-4 flex gap-4 overflow-x-auto pb-1">
                {data.recentAchievements.slice(0, 6).map((a) => {
                  const ring =
                    a.rarity === 'rare'
                      ? 'border-accent/50 bg-accent-subtle text-accent'
                      : a.rarity === 'epic'
                        ? 'border-warning/50 bg-warning-subtle text-warning'
                        : a.rarity === 'legendary'
                          ? 'border-danger/50 bg-danger-subtle text-danger'
                          : a.rarity === 'uncommon'
                            ? 'border-success/50 bg-success-subtle text-success'
                            : 'border-border-strong bg-surface-2 text-text-secondary';
                  const content = (
                    <>
                      <span
                        className={cn(
                          'flex size-14 shrink-0 items-center justify-center rounded-full border-2',
                          ring,
                        )}
                      >
                        <AchievementIcon name={a.icon} />
                      </span>
                      <span className="mt-2 block w-24 truncate text-center text-xs font-medium text-text" title={a.title}>
                        {a.title}
                      </span>
                      <span className="block text-center text-[10px] uppercase tracking-wider text-text-tertiary">
                        {a.rarity}
                      </span>
                    </>
                  );
                  return (
                    <li key={a.slug} className="flex w-24 shrink-0 flex-col items-center">
                      {a.shareSlug ? (
                        <Link to={`/achievements/${a.shareSlug}`} className="flex w-24 flex-col items-center">
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-label="Leaderboard" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-text">Top learners</h2>
              <Link to="/leaderboard" className="text-xs font-medium text-accent hover:underline">
                View all
              </Link>
            </div>
            {data.rankEntries.length === 0 ? (
              <p className="mt-4 text-sm text-text-tertiary">No ranked learners yet.</p>
            ) : (
              <ol className="mt-3 space-y-1">
                {data.rankEntries.slice(0, 5).map((entry, i) => (
                  <li key={entry.username} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                    <span className="w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-text-tertiary">
                      {i + 1}
                    </span>
                    <Avatar name={entry.name} src={entry.avatarUrl} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{entry.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-text-secondary">{formatXp(entry.xp)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </motion.div>
  );
}
