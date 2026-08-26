import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Crosshair,
  EyeOff,
  Flag,
  Lock,
  Medal,
  Timer,
  Trophy,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useSeo } from '@/lib/seo';
import { formatDate, formatMinutes, formatXp, timeAgo } from '@/lib/utils';
import { Avatar, Badge, Card, CardContent, EmptyState, ErrorState, Progress, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AchievementMedallion } from '@/features/achievements/achievement-icon';
import type { AchievementPublic } from '@suraksha/shared';

/* --------------------------------- Types ---------------------------------- */

interface ProfileAchievement extends AchievementPublic {
  unlockedAt: string | null;
}

interface PublicProfile {
  user: {
    name: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    levelTitle: string | null;
    levelOrder: number | null;
  };
  xp: number;
  globalRank: number | null;
  percentile: number | null;
  stats: {
    labsSolved: number;
    lessonsCompleted: number;
    achievements: number;
    firstAttemptRate: number;
    avgSolveMinutes: number;
  };
  achievements: ProfileAchievement[];
  skills: { category: string; solved: number }[];
  recentActivity: { kind: string; title: string; at: string }[];
  joinedAt: string;
}

const ACTIVITY_ICONS: Record<string, typeof Flag> = {
  lab: Flag,
  lesson: BookOpen,
  achievement: Trophy,
};

function activityIcon(kind: string) {
  return ACTIVITY_ICONS[kind] ?? Activity;
}

/* ------------------------------- Sub-views --------------------------------- */

function StatTile({ icon: Icon, label, value, sub }: { icon: typeof Flag; label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3.5">
      <p className="micro-label flex items-center gap-1.5">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-xl font-bold tabular-nums tracking-tight text-text">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

function SkillsSection({ skills }: { skills: PublicProfile['skills'] }) {
  const max = Math.max(1, ...skills.map((s) => s.solved));
  return (
    <Card>
      <CardContent>
        <h2 className="font-semibold tracking-tight text-text">Skills</h2>
        <p className="text-sm text-text-secondary">Labs solved per category.</p>
        <div className="mt-5 space-y-4">
          {skills.map((s) => (
            <div key={s.category}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-text">{s.category}</span>
                <span className="tabular-nums text-text-tertiary">
                  {s.solved} solved
                </span>
              </div>
              <Progress value={(s.solved / max) * 100} label={`${s.category} labs solved`} className="mt-1.5 h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementsSection({ achievements }: { achievements: ProfileAchievement[] }) {
  if (achievements.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="No achievements yet"
        description="Completing labs and lessons unlocks achievements."
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((a) => {
        const locked = a.unlockedAt === null;
        return (
          <li
            key={a.slug}
            className={
              locked
                ? 'flex items-start gap-3.5 rounded-lg border border-dashed border-border bg-surface p-4'
                : 'flex items-start gap-3.5 rounded-lg border border-border bg-surface p-4'
            }
          >
            <span className="relative shrink-0">
              <AchievementMedallion icon={a.icon} rarity={a.rarity} size="md" locked={locked} />
              {locked && (
                <Lock className="absolute inset-0 m-auto size-4 text-text-tertiary" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className={locked ? 'text-sm font-semibold text-text-secondary' : 'text-sm font-semibold text-text'}>
                  {a.title}
                </p>
                <span className="shrink-0 text-xs font-medium tabular-nums text-accent">+{formatXp(a.xpReward)}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-tertiary">{a.description}</p>
              <p className="mt-1.5 text-[11px] capitalize text-text-tertiary">
                {locked ? 'Locked' : `Unlocked ${timeAgo(a.unlockedAt as string)} Â· ${a.rarity}`}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function RecentActivity({ activity }: { activity: PublicProfile['recentActivity'] }) {
  if (activity.length === 0) return null;
  return (
    <Card>
      <CardContent>
        <h2 className="font-semibold tracking-tight text-text">Recent activity</h2>
        <ul className="mt-4 divide-y divide-border">
          {activity.slice(0, 8).map((item, i) => {
            const Icon = activityIcon(item.kind);
            return (
              <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-text-tertiary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm text-text">{item.title}</p>
                <time className="shrink-0 text-xs text-text-tertiary" dateTime={item.at}>
                  {timeAgo(item.at)}
                </time>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function ProfilePage() {
  const { username = '' } = useParams();
  const { user, loading: authLoading } = useAuth();

  // '/profile/me' resolves to the signed-in user's profile.
  const effectiveUsername = username === 'me' ? (user?.username ?? '') : username;

  const profileQuery = useQuery({
    queryKey: qk.profile(effectiveUsername),
    queryFn: () => api<PublicProfile>(`/profiles/${effectiveUsername}`),
    enabled: effectiveUsername.length > 0,
    retry: false,
  });

  const profile = profileQuery.data;

  useSeo(
    profile ? `${profile.user.name} (@${profile.user.username}) â€” Suraksha Labs` : 'Profile â€” Suraksha Labs',
    profile?.user.bio ?? undefined,
  );

  if (username === 'me' && authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="mx-auto h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!effectiveUsername) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sign in to view your profile"
          description="Create a free account to start solving labs."
          action={
            <Link to="/login">
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (profileQuery.isPending || (profileQuery.isLoading && !profile)) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-5 rounded-lg border border-border bg-surface p-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2.5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (profileQuery.isError) {
    const err = profileQuery.error;
    if (err instanceof ApiError && err.status === 403) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <EmptyState
            icon={EyeOff}
            title="This profile is private"
            description={`${effectiveUsername} has chosen to keep their learning journey private.`}
            action={
              <Link to="/leaderboard">
                <Button variant="outline">View the leaderboard</Button>
              </Link>
            }
          />
        </div>
      );
    }
    if (err instanceof ApiError && err.status === 404) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <EmptyState
            icon={EyeOff}
            title="Profile not found"
            description={`No learner with the username â€œ${effectiveUsername}â€ exists.`}
            action={
              <Link to="/labs">
                <Button variant="outline">Explore labs</Button>
              </Link>
            }
          />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <ErrorState
          title="Could not load this profile"
          description="Something went wrong. Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => void profileQuery.refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!profile) return null;
  const isOwnProfile = user?.username === profile.user.username;
  const s = profile.stats;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* ------------------------------- Header ------------------------------- */}
      <Card>
        <CardContent className="sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={profile.user.name} src={profile.user.avatarUrl} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h1 className="truncate text-2xl font-bold tracking-tight text-text">{profile.user.name}</h1>
                {profile.user.levelTitle && (
                  <Badge variant="accent" className="capitalize">
                    <Medal className="size-3.5" aria-hidden />
                    {profile.user.levelTitle}
                  </Badge>
                )}
                {isOwnProfile && (
                  <Link to="/settings" className="text-xs font-medium text-accent hover:text-accent-hover">
                    Edit profile
                  </Link>
                )}
              </div>
              <p className="mt-0.5 text-sm text-text-tertiary">@{profile.user.username}</p>
              {profile.user.bio && <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">{profile.user.bio}</p>}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-text-tertiary">
                <CalendarDays className="size-3.5" aria-hidden />
                Joined {formatDate(profile.joinedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------- Stats ------------------------------ */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatTile
          icon={Trophy}
          label="XP"
          value={formatXp(profile.xp)}
          sub={
            <>
              {profile.globalRank !== null && <>Rank #{formatXp(profile.globalRank)}</>}
              {profile.globalRank !== null && profile.percentile !== null && ' Â· '}
              {profile.percentile !== null && <>Top {profile.percentile}%</>}
            </>
          }
        />
        <StatTile icon={Flag} label="Labs solved" value={formatXp(s.labsSolved)} />
        <StatTile icon={BookOpen} label="Lessons completed" value={formatXp(s.lessonsCompleted)} />
        <StatTile icon={Medal} label="Achievements" value={formatXp(s.achievements)} />
        <StatTile
          icon={Crosshair}
          label="First-attempt rate"
          value={`${Math.round(s.firstAttemptRate * 100)}%`}
        />
        <StatTile icon={Timer} label="Avg solve time" value={s.avgSolveMinutes > 0 ? formatMinutes(s.avgSolveMinutes) : 'â€”'} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ---------------------------- Achievements ---------------------------- */}
        <section className="order-2 lg:order-1">
          <h2 className="text-lg font-semibold tracking-tight text-text">Achievements</h2>
          <div className="mt-4">
            <AchievementsSection achievements={profile.achievements} />
          </div>
        </section>

        {/* ------------------------- Skills + activity -------------------------- */}
        <aside className="order-1 space-y-6 lg:order-2">
          {profile.skills.length > 0 && <SkillsSection skills={profile.skills} />}
          <RecentActivity activity={profile.recentActivity} />
        </aside>
      </div>

      {isOwnProfile && (
        <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
          <CheckCircle2 className="size-3.5 text-success" aria-hidden />
          This is how your public profile appears to other learners.
        </p>
      )}
    </div>
  );
}
