import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  Copy,
  Edit3,
  EyeOff,
  Flame,
  FlaskConical,
  Medal,
  Share2,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from 'lucide-react';
import type { AchievementPublic } from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { createProgressCard, shareProgressCard } from '@/lib/share-card';
import { formatDate, formatMinutes, formatXp, timeAgo } from '@/lib/utils';
import { AchievementMedallion } from '@/features/achievements/achievement-icon';
import { Avatar, Badge, EmptyState, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface ProfileAchievement extends AchievementPublic { unlockedAt: string; shareSlug: string | null }
interface PublicProfile {
  user: { name: string; username: string; avatarUrl: string | null; bio: string | null; levelTitle: string | null; levelOrder: number | null };
  xp: number;
  globalRank: number | null;
  percentile: number | null;
  streakDays: number;
  stats: { labsSolved: number; lessonsCompleted: number; achievements: number; firstAttemptRate: number | null; avgSolveMinutes: number | null };
  achievements: ProfileAchievement[];
  skills: { category: string; solved: number }[];
  recentActivity: { kind: string; title: string; at: string }[];
  joinedAt: string;
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="border-l border-border pl-4"><p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">{label}</p><p className="metric-number mt-2 text-2xl font-bold text-text">{value}</p>{note && <p className="mt-1 text-[11px] text-text-tertiary">{note}</p>}</div>;
}

function iconFor(kind: string) {
  if (kind.includes('lab')) return FlaskConical;
  if (kind.includes('lesson')) return BookOpen;
  if (kind.includes('achievement')) return Award;
  return Activity;
}

export default function ProfileV2() {
  const { username = '' } = useParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);
  const effectiveUsername = username === 'me' ? user?.username ?? '' : username;
  const profileQuery = useQuery({ queryKey: qk.profile(effectiveUsername), queryFn: () => api<PublicProfile>(`/profiles/${effectiveUsername}`), enabled: effectiveUsername.length > 0, retry: false });
  const profile = profileQuery.data;
  const isOwn = user?.username === profile?.user.username;
  useSeo(profile ? `${profile.user.name} | Suraksha Labs skill passport` : 'Learner profile | Suraksha Labs', profile?.user.bio ?? undefined);

  async function shareProfile() {
    if (!profile || sharing) return;
    setSharing(true);
    try {
      if (isOwn) {
        const file = await createProgressCard({ name: profile.user.name, username: profile.user.username, level: profile.user.levelTitle ?? 'New learner', xp: profile.xp, labs: profile.stats.labsSolved, lessons: profile.stats.lessonsCompleted, achievements: profile.stats.achievements, streak: profile.streakDays, rank: profile.globalRank });
        const result = await shareProgressCard(file, `${profile.user.name}'s Suraksha Labs progress`, 'My cybersecurity learning progress on Suraksha Labs.');
        toast('success', result === 'shared' ? 'Share card ready' : 'Share card downloaded', result === 'shared' ? 'Choose Instagram or another app from the share sheet.' : 'Upload the 4:5 image to Instagram, LinkedIn, or anywhere else.');
      } else if (navigator.share) {
        await navigator.share({ title: `${profile.user.name} on Suraksha Labs`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast('success', 'Profile link copied');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast('error', 'Could not share this profile', 'Try copying the page link instead.');
    } finally { setSharing(false); }
  }

  if (username === 'me' && loading) return <div className="mx-auto max-w-6xl px-4 py-10"><Skeleton className="h-72 rounded-xl" /></div>;
  if (!effectiveUsername) return <div className="mx-auto max-w-4xl px-4 py-20"><EmptyState title="Sign in to view your profile" description="Your profile becomes a record of the skills you earn." action={<Link to="/login"><Button>Sign in</Button></Link>} /></div>;
  if (profileQuery.isLoading) return <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-56 rounded-xl" /></div>;
  if (profileQuery.isError) {
    const error = profileQuery.error;
    const privateProfile = error instanceof ApiError && error.status === 403;
    const missing = error instanceof ApiError && error.status === 404;
    return <div className="mx-auto max-w-4xl px-4 py-20"><EmptyState icon={EyeOff} title={privateProfile ? 'This skill passport is private' : missing ? 'Learner not found' : 'This profile did not load'} description={privateProfile ? 'This learner shares progress only with themselves.' : missing ? `There is no learner named @${effectiveUsername}.` : 'Check your connection, then try again.'} action={!privateProfile && !missing ? <Button variant="outline" onClick={() => void profileQuery.refetch()}>Try again</Button> : undefined} /></div>;
  }
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <section className="signal-panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar name={profile.user.name} src={profile.user.avatarUrl} size="xl" className="ring-4 ring-accent/20" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="page-title truncate">{profile.user.name}</h1>{profile.user.levelTitle && <Badge variant="accent"><Medal className="size-3.5" />{profile.user.levelTitle}</Badge>}</div><p className="mt-1 font-mono text-sm text-text-tertiary">@{profile.user.username}</p>{profile.user.bio ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">{profile.user.bio}</p> : isOwn ? <p className="mt-4 text-sm text-text-tertiary">Add a short bio to explain what you are learning.</p> : null}<p className="mt-4 flex items-center gap-2 text-xs text-text-tertiary"><CalendarDays className="size-3.5" />Learning since {formatDate(profile.joinedAt)}</p></div>
          <div className="flex shrink-0 flex-wrap gap-2"><Button onClick={() => void shareProfile()} loading={sharing}><Share2 className="size-4" />{isOwn ? 'Share story card' : 'Share profile'}</Button>{isOwn && <Link to="/settings"><Button variant="outline"><Edit3 className="size-4" />Edit</Button></Link>}</div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="Total XP" value={formatXp(profile.xp)} />
          <Metric label="Global rank" value={profile.globalRank ? `#${formatXp(profile.globalRank)}` : 'New'} note={profile.percentile ? `Top ${profile.percentile}%` : undefined} />
          <Metric label="Labs solved" value={formatXp(profile.stats.labsSolved)} />
          <Metric label="Lessons" value={formatXp(profile.stats.lessonsCompleted)} />
          <Metric label="Achievements" value={formatXp(profile.stats.achievements)} />
          <Metric label="Daily streak" value={`${profile.streakDays}d`} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
        <main className="space-y-6">
          <section className="surface-panel p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4"><div><p className="signal-label"><Sparkles className="size-3.5" /> Verified achievements</p><h2 className="mt-3 text-xl font-semibold">Proof collected</h2></div><span className="font-mono text-xs text-text-tertiary">{profile.achievements.length} unlocked</span></div>
            {profile.achievements.length === 0 ? <div className="mt-5"><EmptyState icon={Award} title="No achievements yet" description="Complete a lesson or solve a lab to unlock the first one." /></div> : <ul className="mt-6 grid gap-3 sm:grid-cols-2">{profile.achievements.map((achievement) => { const content = <><AchievementMedallion icon={achievement.icon} rarity={achievement.rarity} size="md" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-text">{achievement.title}</span><span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-text-tertiary">{achievement.description}</span><span className="mt-2 block font-mono text-[10px] uppercase text-accent">{achievement.rarity}  +{achievement.xpReward} XP</span></span></>; return <li key={achievement.slug}>{achievement.shareSlug ? <Link to={`/achievements/${achievement.shareSlug}`} className="flex h-full gap-3 rounded-xl border border-border bg-bg-subtle p-4 hover:border-border-strong">{content}</Link> : <div className="flex h-full gap-3 rounded-xl border border-border bg-bg-subtle p-4">{content}</div>}</li>; })}</ul>}
          </section>

          <section className="surface-panel p-5 sm:p-6"><p className="signal-label"><Target className="size-3.5" /> Capability evidence</p><h2 className="mt-3 text-xl font-semibold">Skills used in labs</h2>{profile.skills.length === 0 ? <p className="mt-5 text-sm text-text-tertiary">Solved labs will build this map automatically.</p> : <div className="mt-5 flex flex-wrap gap-3">{profile.skills.map((skill) => <div key={skill.category} className="rounded-xl border border-border bg-bg-subtle px-4 py-3"><span className="text-sm font-semibold">{skill.category}</span><span className="ml-3 font-mono text-xs text-accent">{skill.solved} solved</span></div>)}</div>}</section>
        </main>

        <aside className="space-y-6">
          <section className="surface-panel p-5"><p className="signal-label"><Flame className="size-3.5" /> Consistency</p><p className="metric-number mt-4 text-5xl font-bold">{profile.streakDays}<span className="ml-2 text-base text-text-tertiary">day streak</span></p><p className="mt-3 text-xs leading-relaxed text-text-tertiary">A streak records showing up. The achievements below record what you can do.</p></section>
          <section className="surface-panel p-5"><h2 className="text-sm font-semibold">Performance</h2><dl className="mt-4 space-y-4"><div className="flex justify-between gap-4"><dt className="flex items-center gap-2 text-sm text-text-secondary"><Target className="size-4" />First-attempt solves</dt><dd className="font-mono text-sm">{profile.stats.firstAttemptRate != null ? `${profile.stats.firstAttemptRate}%` : 'No data'}</dd></div><div className="flex justify-between gap-4"><dt className="flex items-center gap-2 text-sm text-text-secondary"><Timer className="size-4" />Average solve</dt><dd className="font-mono text-sm">{profile.stats.avgSolveMinutes ? formatMinutes(profile.stats.avgSolveMinutes) : 'No data'}</dd></div><div className="flex justify-between gap-4"><dt className="flex items-center gap-2 text-sm text-text-secondary"><Trophy className="size-4" />Global standing</dt><dd className="font-mono text-sm">{profile.globalRank ? `#${profile.globalRank}` : 'Unranked'}</dd></div></dl></section>
          <section className="surface-panel p-5"><h2 className="text-sm font-semibold">Recent work</h2>{profile.recentActivity.length === 0 ? <p className="mt-4 text-sm text-text-tertiary">No public activity yet.</p> : <ul className="mt-4 space-y-4">{profile.recentActivity.slice(0, 6).map((item, index) => { const Icon = iconFor(item.kind); return <li key={`${item.at}-${index}`} className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-secondary"><Icon className="size-3.5" /></span><span className="min-w-0 flex-1"><span className="line-clamp-2 block text-xs leading-relaxed text-text-secondary">{item.title}</span><time className="mt-1 block font-mono text-[10px] text-text-tertiary">{timeAgo(item.at)}</time></span></li>; })}</ul>}</section>
          {isOwn && <button onClick={async () => { await navigator.clipboard.writeText(window.location.href); toast('success', 'Profile link copied'); }} className="flex w-full items-center justify-center gap-2 text-xs font-medium text-text-tertiary hover:text-accent"><Copy className="size-3.5" />Copy public profile link</button>}
        </aside>
      </div>
    </div>
  );
}
