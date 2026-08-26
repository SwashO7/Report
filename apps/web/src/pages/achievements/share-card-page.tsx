import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  Copy,
  ExternalLink,
  Flag,
  Linkedin,
  SearchX,
  ShieldCheck,
  TimerReset,
  Twitter,
  Zap,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { formatDate, formatDuration, formatXp } from '@/lib/utils';
import { Avatar, Badge, EmptyState } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { AchievementMedallion } from '@/features/achievements/achievement-icon';
import type { ShareCardData } from '@suraksha/shared';

function BrandHeader() {
  return (
    <div className="flex items-center justify-center gap-2.5 border-b border-border pb-5">
      <img src="/brand/logo-dark.png" alt="" className="size-7 dark:hidden" aria-hidden />
      <img src="/brand/logo-white.png" alt="" className="hidden size-7 dark:block" aria-hidden />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-text">Suraksha Labs</span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
          by Shadow Security
        </span>
      </span>
    </div>
  );
}

export default function ShareCardPage() {
  const { shareSlug = '' } = useParams();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.shareCard(shareSlug),
    queryFn: () => api<ShareCardData>(`/public/achievements/${shareSlug}`),
    retry: false,
  });

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const achievement = data?.achievement;

  useSeo(
    achievement
      ? `${achievement.title} â€” Achievement by ${data?.user.name} | Suraksha Labs`
      : 'Verified achievement | Suraksha Labs',
    achievement
      ? `${data?.user.name} earned "${achievement.title}" on Suraksha Labs by Shadow Security.`
      : undefined,
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast('success', 'Link copied', 'Share it anywhere to verify this achievement.');
    } catch {
      toast('error', 'Could not copy', 'Copy the link from your browser address bar instead.');
    }
  }

  function shareToX() {
    if (!achievement) return;
    const text = `${card.user.name} earned "${achievement.title}" on Suraksha Labs`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=520',
    );
  }

  function shareToLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=520',
    );
  }

  /* -------------------------------- States -------------------------------- */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-surface p-8">
          <div className="skeleton h-10 w-40 self-center" />
          <div className="skeleton mx-auto size-24 rounded-full" />
          <div className="skeleton h-6 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-9 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={notFound ? SearchX : ShieldCheck}
          title={notFound ? 'Achievement not found' : 'Could not verify this achievement'}
          description={
            notFound
              ? 'This verification link is invalid or has been revoked.'
              : 'Something went wrong while loading this achievement card.'
          }
          action={
            <Link to="/labs">
              <Button variant="outline">Explore labs</Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* --------------------------------- Card ---------------------------------- */

  const card = data;
  const ach = card.achievement;

  const stats: { icon: typeof Zap; label: string; value: string | null }[] = [
    { icon: Zap, label: 'XP earned', value: `+${formatXp(card.xpAwarded)}` },
    {
      icon: TimerReset,
      label: 'Solve time',
      value: card.solveTimeSeconds !== null ? formatDuration(card.solveTimeSeconds) : null,
    },
    {
      icon: BadgeCheck,
      label: 'Percentile',
      value: card.percentile !== null ? `Faster than ${card.percentile}%` : null,
    },
  ];

  return (
    <div className="min-h-[70vh] bg-bg-subtle px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-md">
        {/* --------------------------- Verification bar -------------------------- */}
        <p className="mb-5 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-success">
          <ShieldCheck className="size-4" aria-hidden />
          Verified achievement · Suraksha Labs
        </p>

        <article className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
          <div className="px-7 pt-7 sm:px-8">
            <BrandHeader />

            <div className="pt-8 text-center">
              <AchievementMedallion icon={ach.icon} rarity={ach.rarity} size="xl" className="shadow-md" />
              <Badge variant="outline" className="mt-5 capitalize">
                {ach.rarity}
              </Badge>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">{ach.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{ach.description}</p>

              <div className="mt-6 flex items-center justify-center gap-3 rounded-lg bg-surface-2 px-4 py-3">
                <Avatar name={card.user.name} src={card.user.avatarUrl} size="md" />
                <div className="min-w-0 text-left leading-tight">
                  <p className="truncate text-sm font-semibold text-text">Earned by {card.user.name}</p>
                  <Link
                    to={`/profile/${card.user.username}`}
                    className="block truncate text-xs text-text-tertiary hover:text-accent"
                  >
                    @{card.user.username}
                  </Link>
                </div>
              </div>

              {card.lab && (
                <Link
                  to={`/labs/${card.lab.slug}`}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                >
                  <Flag className="size-3.5 shrink-0 text-accent" aria-hidden />
                  <span className="truncate">
                    Solved <span className="font-medium text-text">{card.lab.title}</span>
                  </span>
                  <ExternalLink className="size-3.5 shrink-0 text-text-tertiary" aria-hidden />
                </Link>
              )}

              <dl className="mt-5 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col bg-surface px-2 py-3 text-center">
                    <dd className="text-sm font-bold tabular-nums text-text">{stat.value ?? 'â€”'}</dd>
                    <dt className="mt-1 text-[11px] font-medium text-text-tertiary">{stat.label}</dt>
                  </div>
                ))}
              </dl>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
                <CalendarDays className="size-3.5" aria-hidden />
                Unlocked on {formatDate(data.unlockedAt)}
              </p>
            </div>
          </div>

          {/* ------------------------------ Actions ------------------------------ */}
          <div className="mt-7 flex items-center gap-2 border-t border-border bg-surface-2/60 px-7 py-4 sm:px-8">
            <Button size="sm" variant="outline" onClick={() => void copyLink()}>
              <Copy className="size-3.5" aria-hidden />
              Copy link
            </Button>
            <Button size="sm" variant="ghost" onClick={shareToX}>
              <Twitter className="size-3.5" aria-hidden />
              X
            </Button>
            <Button size="sm" variant="ghost" onClick={shareToLinkedIn}>
              <Linkedin className="size-3.5" aria-hidden />
              LinkedIn
            </Button>
          </div>
        </article>

        {/* ---------------------------- Verification url ---------------------------- */}
        <p className="mt-4 break-all text-center text-[11px] leading-relaxed text-text-tertiary">
          Verify at {pageUrl}
        </p>
      </div>
    </div>
  );
}
