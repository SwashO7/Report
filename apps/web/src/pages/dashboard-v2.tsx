import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Clock3,
  Flame,
  FlaskConical,
  PencilLine,
  Play,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { LessonDetail, UserAchievementPublic, XpProgress } from '@suraksha/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { qk } from '@/lib/queries';
import { formatMinutes, formatXp, timeAgo } from '@/lib/utils';
import { Avatar, Badge, ErrorState, Progress, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardData {
  xp: XpProgress;
  continueLesson: { slug: string; title: string; moduleTitle: string; estimatedMinutes: number } | null;
  stats: { labsSolved: number; lessonsCompleted: number; achievements: number; globalRank: number | null; firstAttemptRate: number | null; avgSolveMinutes: number | null };
  recentAchievements: UserAchievementPublic[];
  recommendedLab: { slug: string; title: string; shortDescription: string; difficultyLabel: string; xpReward: number; estimatedMinutes: number } | null;
  recentActivity: { kind: string; title: string; at: string; link: string }[];
  rankEntries: { username: string; name: string; avatarUrl: string | null; xp: number }[];
  momentum: { streakDays: number; todayXp: number; dailyGoalXp: number; activeDays: string[] };
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="border-l border-border pl-4">
      <span className="flex items-center gap-2 text-xs font-medium text-text-tertiary"><Icon className="size-3.5" aria-hidden />{label}</span>
      <strong className="metric-number mt-2 block text-2xl text-text">{value}</strong>
    </div>
  );
}

function WeekPulse({ activeDays }: { activeDays: string[] }) {
  const active = new Set(activeDays);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - index));
    return { iso: date.toISOString().slice(0, 10), label: date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1), today: index === 6 };
  });
  return (
    <div className="grid grid-cols-7 gap-2" aria-label="Activity during the last seven days">
      {days.map((day) => (
        <div key={day.iso} className="text-center">
          <span className={day.today ? 'font-mono text-[10px] text-accent' : 'font-mono text-[10px] text-text-tertiary'}>{day.label}</span>
          <span className={active.has(day.iso) ? 'mx-auto mt-2 flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground' : 'mx-auto mt-2 flex size-7 items-center justify-center rounded-lg border border-border bg-bg-subtle text-text-tertiary'}>
            {active.has(day.iso) ? <Check className="size-3.5" aria-hidden /> : <span className="size-1 rounded-full bg-border-strong" />}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardV2() {
  const { user } = useAuth();
  const dashboard = useQuery({ queryKey: qk.dashboard, queryFn: () => api<DashboardData>('/dashboard') });
  const data = dashboard.data;
  const lesson = useQuery({
    queryKey: data?.continueLesson ? qk.lesson(data.continueLesson.slug) : ['learn', 'lesson', 'none'],
    queryFn: () => api<LessonDetail>(`/learn/lessons/${data!.continueLesson!.slug}`),
    enabled: Boolean(data?.continueLesson),
  });

  if (dashboard.isLoading) return <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-10"><Skeleton className="h-14 w-72" /><Skeleton className="h-80 w-full rounded-xl" /><div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-56 rounded-xl lg:col-span-2" /><Skeleton className="h-56 rounded-xl" /></div></div>;
  if (dashboard.isError || !data) return <div className="mx-auto max-w-5xl px-4 py-20"><ErrorState title="Your workspace did not load" description="Check your connection, then try again." action={<Button variant="outline" onClick={() => void dashboard.refetch()}>Try again</Button>} /></div>;

  const dailyPct = Math.min(100, (data.momentum.todayXp / data.momentum.dailyGoalXp) * 100);
  const lessonHref = lesson.data ? `/learn/${lesson.data.pathSlug}/${lesson.data.slug}` : '/learn';
  const firstName = user?.name.split(' ')[0] ?? 'Learner';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 pr-0 lg:pr-14">
        <div><p className="signal-label">Today at Suraksha</p><h1 className="page-title mt-3">Welcome back, {firstName}</h1><p className="mt-2 text-sm text-text-secondary">One focused session is enough to move forward.</p></div>
        <Link to={`/profile/${user?.username}`} className="text-sm font-medium text-text-secondary hover:text-accent">View proof-of-skill profile</Link>
      </header>

      <section className="signal-panel p-5 sm:p-7 lg:p-9" aria-labelledby="today-mission">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:items-end">
          <div>
            <p className="signal-label"><Target className="size-3.5" /> Next best action</p>
            <h2 id="today-mission" className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-text sm:text-4xl">{data.continueLesson?.title ?? 'Begin with the foundations'}</h2>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
              <span>{data.continueLesson?.moduleTitle ?? 'Level 0 learning path'}</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" />{formatMinutes(data.continueLesson?.estimatedMinutes ?? 15)}</span>
            </p>
            <Link to={data.continueLesson ? lessonHref : '/learn'} className="mt-7 inline-flex"><Button size="lg"><Play className="size-4 fill-current" />{data.continueLesson ? 'Resume lesson' : 'Start learning'}<ArrowRight className="size-4" /></Button></Link>
          </div>
          <div className="rounded-xl border border-border bg-bg/60 p-4">
            <div className="flex items-end justify-between gap-4"><div><p className="signal-label">Daily target</p><p className="metric-number mt-2 text-3xl font-bold text-text">{formatXp(data.momentum.todayXp)} <span className="text-base text-text-tertiary">/ {data.momentum.dailyGoalXp} XP</span></p></div><span className={dailyPct >= 100 ? 'text-sm font-semibold text-success' : 'text-sm font-medium text-accent'}>{dailyPct >= 100 ? 'Complete' : `${Math.round(dailyPct)}%`}</span></div>
            <Progress value={dailyPct} label="Daily XP target" className="mt-4 h-2" />
            <p className="mt-3 text-xs leading-relaxed text-text-tertiary">Lessons, practice, and labs all count. The target is intentionally small.</p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.7fr)]">
        <main className="space-y-5">
          <section className="surface-panel p-5 sm:p-6" aria-labelledby="session-plan">
            <div className="flex items-center justify-between gap-4"><div><p className="signal-label">Session plan</p><h2 id="session-plan" className="mt-2 text-xl font-semibold tracking-tight">Learn, check, apply</h2></div><span className="font-mono text-xs text-text-tertiary">30-60 min</span></div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link to={lessonHref} className="mission-step group flex gap-3 md:block"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><BookOpen className="size-4" /></span><div className="md:mt-3"><p className="text-sm font-semibold group-hover:text-accent">1. Understand</p><p className="mt-1 text-xs leading-relaxed text-text-tertiary">Continue your current lesson.</p></div></Link>
              <Link to="/practice" className="mission-step group flex gap-3 md:block"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-secondary"><PencilLine className="size-4" /></span><div className="md:mt-3"><p className="text-sm font-semibold group-hover:text-accent">2. Recall</p><p className="mt-1 text-xs leading-relaxed text-text-tertiary">Answer a short checked exercise.</p></div></Link>
              <Link to={data.recommendedLab ? `/labs/${data.recommendedLab.slug}` : '/labs'} className="mission-step group flex gap-3 md:block"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-secondary"><FlaskConical className="size-4" /></span><div className="md:mt-3"><p className="text-sm font-semibold group-hover:text-accent">3. Prove it</p><p className="mt-1 text-xs leading-relaxed text-text-tertiary">Apply the skill in a real local lab.</p></div></Link>
            </div>
          </section>

          <section className="surface-panel p-5 sm:p-6" aria-label="Progress summary">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Metric icon={BookOpen} label="Lessons" value={formatXp(data.stats.lessonsCompleted)} />
              <Metric icon={FlaskConical} label="Labs" value={formatXp(data.stats.labsSolved)} />
              <Metric icon={Award} label="Badges" value={formatXp(data.stats.achievements)} />
              <Metric icon={Trophy} label="Global rank" value={data.stats.globalRank ? `#${formatXp(data.stats.globalRank)}` : 'New'} />
            </div>
          </section>

          {data.recommendedLab && (
            <section className="surface-panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent"><FlaskConical className="size-5" /></span>
              <div className="min-w-0 flex-1"><p className="signal-label">Recommended lab</p><h2 className="mt-2 text-lg font-semibold">{data.recommendedLab.title}</h2><p className="mt-1 line-clamp-2 text-sm text-text-secondary">{data.recommendedLab.shortDescription}</p><div className="mt-3 flex gap-2"><Badge>{data.recommendedLab.difficultyLabel}</Badge><Badge variant="accent">+{data.recommendedLab.xpReward} XP</Badge></div></div>
              <Link to={`/labs/${data.recommendedLab.slug}`}><Button variant="outline" className="w-full sm:w-auto">Open lab <ArrowRight className="size-4" /></Button></Link>
            </section>
          )}
        </main>

        <aside className="space-y-5">
          <section className="surface-panel p-5">
            <div className="flex items-center justify-between"><div><p className="signal-label">Consistency</p><p className="metric-number mt-2 text-4xl font-bold text-text">{data.momentum.streakDays}<span className="ml-2 text-base text-text-tertiary">days</span></p></div><span className="flex size-12 items-center justify-center rounded-xl bg-accent-subtle text-accent"><Flame className="size-6" /></span></div>
            <div className="mt-6"><WeekPulse activeDays={data.momentum.activeDays} /></div>
            <p className="mt-4 text-xs leading-relaxed text-text-tertiary">Missed a day? Start again today. Consistency matters more than a perfect number.</p>
          </section>

          <section className="surface-panel p-5">
            <div className="flex items-center justify-between"><div><p className="signal-label">Level progress</p><h2 className="mt-2 font-semibold">{data.xp.level?.title ?? 'New learner'}</h2></div><strong className="metric-number text-xl">{formatXp(data.xp.xp)}</strong></div>
            <Progress value={data.xp.progressPercent} label="Level progress" className="mt-4" />
            <p className="mt-3 text-xs text-text-tertiary">{data.xp.xpToNextLevel != null ? `${formatXp(data.xp.xpToNextLevel)} XP to ${data.xp.nextLevel?.title}` : 'Highest level reached'}</p>
          </section>

          <section className="surface-panel p-5">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Latest activity</h2><Link to={`/profile/${user?.username}`} className="text-xs font-medium text-accent">All</Link></div>
            {data.recentActivity.length === 0 ? <p className="mt-4 text-sm text-text-tertiary">Complete a lesson to start your record.</p> : <ul className="mt-3 space-y-3">{data.recentActivity.slice(0, 4).map((item, index) => <li key={`${item.at}-${index}`}><Link to={item.link || '/dashboard'} className="flex items-start gap-3"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" /><span className="min-w-0 flex-1"><span className="line-clamp-1 block text-sm text-text-secondary">{item.title}</span><span className="mt-0.5 block text-[11px] text-text-tertiary">{timeAgo(item.at)}</span></span></Link></li>)}</ul>}
          </section>

          {data.rankEntries.length > 0 && <section className="surface-panel p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">People to learn with</h2><Link to="/leaderboard" className="text-xs font-medium text-accent">Rankings</Link></div><ul className="mt-3 space-y-2">{data.rankEntries.slice(0, 3).map((entry, index) => <li key={entry.username} className="flex items-center gap-3"><span className="w-4 font-mono text-xs text-text-tertiary">{index + 1}</span><Avatar name={entry.name} src={entry.avatarUrl} size="sm" /><span className="min-w-0 flex-1 truncate text-sm">{entry.name}</span><span className="font-mono text-xs text-text-tertiary">{formatXp(entry.xp)}</span></li>)}</ul></section>}
        </aside>
      </div>
    </motion.div>
  );
}
