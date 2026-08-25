import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Flag, Medal, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useSeo } from '@/lib/seo';
import { cn, formatXp } from '@/lib/utils';
import { Avatar, Badge, EmptyState, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/overlay';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import type { LeaderboardEntry, LeaderboardResponse } from '@suraksha/shared';

interface LabMeta {
  categories: { slug: string; name: string; labCount: number }[];
}

/* ------------------------------ Rank styling ------------------------------- */

const RANK_STYLES: Record<number, string> = {
  1: 'bg-warning/15 text-warning',
  2: 'bg-surface-3 text-text-secondary',
  3: 'bg-danger-subtle text-danger/80',
};

function RankChip({ rank, size = 'md' }: { rank: number; size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums',
        size === 'lg' ? 'size-10 text-base' : 'size-7 text-xs',
        RANK_STYLES[rank] ?? 'bg-surface-2 text-text-tertiary',
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

/* --------------------------------- Podium ---------------------------------- */

function Podium({ entries, valueLabel }: { entries: LeaderboardEntry[]; valueLabel: string }) {
  const byRank = new Map(entries.map((e) => [e.rank, e]));
  const first = byRank.get(1);
  const second = byRank.get(2);
  const third = byRank.get(3);
  if (!first && !second && !third) return null;

  const slot = (entry: LeaderboardEntry | undefined, elevated: boolean) => (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center gap-2.5 rounded-xl border bg-surface px-3 pt-5 pb-6 text-center shadow-xs transition-all sm:px-4',
        elevated ? 'z-10 -translate-y-4 border-accent/40 shadow-md sm:-translate-y-5' : 'border-border',
      )}
    >
      {entry ? (
        <>
          <RankChip rank={entry.rank} size="lg" />
          <Avatar name={entry.user.name} src={entry.user.avatarUrl} size="lg" className="ring-2 ring-border" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{entry.user.name}</p>
            <p className="truncate text-xs text-text-tertiary">@{entry.user.username}</p>
          </div>
          <p className="text-sm font-bold tabular-nums text-accent">
            {formatXp(entry.value)} {valueLabel}
          </p>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 py-6 opacity-40">
          <Medal className="size-5" aria-hidden />
          <span className="text-xs">Open spot</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 items-end gap-3 sm:gap-4" aria-label="Top three">
      {slot(second, false)}
      {slot(first, true)}
      {slot(third, false)}
    </div>
  );
}

/* ------------------------------- Entry rows -------------------------------- */

function EntryUser({ entry }: { entry: LeaderboardEntry }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={entry.user.name} src={entry.user.avatarUrl} size="sm" />
      <span className="min-w-0 leading-tight">
        <Link
          to={`/profile/${entry.user.username}`}
          className="block truncate text-sm font-medium text-text hover:text-accent"
        >
          {entry.user.name}
        </Link>
        <span className="block truncate text-xs text-text-tertiary">@{entry.user.username}</span>
      </span>
    </span>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  useSeo(
    'Leaderboard — Suraksha Labs',
    'See the top cybersecurity learners on Suraksha Labs. Global and per-category rankings by XP.',
  );

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  };

  const metaQuery = useQuery({
    queryKey: qk.labMeta,
    queryFn: () => api<LabMeta>('/labs/meta'),
    staleTime: 300_000,
  });

  const qs = new URLSearchParams(searchParams).toString();
  const boardQuery = useQuery({
    queryKey: qk.leaderboard(qs),
    queryFn: () => api<LeaderboardResponse>(`/leaderboard?${qs}`),
    placeholderData: (prev) => prev,
  });

  const data = boardQuery.data;
  const entries = data?.entries ?? [];
  const me = data?.me ?? null;
  const showLabsColumn = entries.some((e) => e.labsSolved !== undefined);
  const valueLabel = data?.scope.kind === 'global' ? 'XP' : 'pts';
  const meOnPage = me !== null && entries.some((e) => e.user.username === me.user.username);
  const tabs = [
    { value: '', label: 'Global' },
    ...(metaQuery.data?.categories ?? []).map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">Leaderboard</h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          The learners putting in the work. Rankings refresh as XP is earned.
        </p>
      </header>

      {/* -------------------------------- Scope -------------------------------- */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Tabs
          tabs={tabs}
          value={categoryParam}
          onChange={(v) => update({ category: v || null })}
          className="max-w-full"
        />
        {data?.scope.kind === 'season' && (
          <Badge variant="accent" className="shrink-0 px-3 py-1">
            <CalendarDays className="size-3.5" aria-hidden />
            {data.scope.label}
          </Badge>
        )}
      </div>

      {/* -------------------------------- Body --------------------------------- */}
      {boardQuery.isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : boardQuery.isError ? (
        <div className="mt-10">
          <EmptyState
            icon={Trophy}
            title="Could not load the leaderboard"
            description="Something went wrong while fetching rankings."
            action={
              <Button variant="outline" onClick={() => void boardQuery.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Flag}
            title="No ranked learners yet"
            description="Solve labs and earn XP to claim the top spots in this category."
          />
        </div>
      ) : (
        <>
          {page === 1 && <Podium entries={entries} valueLabel={valueLabel} />}

          {/* ------------------------------ Desktop ------------------------------ */}
          <TableCard className="mt-8 hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH className="w-16">Rank</TH>
                  <TH>Learner</TH>
                  {showLabsColumn && <TH className="text-right">Labs solved</TH>}
                  <TH className="text-right">{valueLabel === 'XP' ? 'XP' : 'Points'}</TH>
                </tr>
              </THead>
              <TBody>
                {entries.map((entry) => {
                  const isMe = me !== null && entry.user.username === me.user.username;
                  return (
                    <TR key={`${entry.rank}-${entry.user.username}`} className={cn(isMe && 'bg-accent-subtle hover:bg-accent-subtle')}>
                      <TD>
                        <span className="flex items-center gap-2">
                          {entry.rank <= 3 ? (
                            <RankChip rank={entry.rank} />
                          ) : (
                            <span className="inline-flex size-7 items-center justify-center text-xs tabular-nums text-text-tertiary">
                              #{entry.rank}
                            </span>
                          )}
                          {isMe && (
                            <Badge variant="accent" className="px-2 py-0 text-[11px]">
                              You
                            </Badge>
                          )}
                        </span>
                      </TD>
                      <TD>
                        <EntryUser entry={entry} />
                      </TD>
                      {showLabsColumn && (
                        <TD className="text-right tabular-nums text-text-secondary">
                          {entry.labsSolved !== undefined ? formatXp(entry.labsSolved) : '—'}
                        </TD>
                      )}
                      <TD className="text-right font-semibold tabular-nums">{formatXp(entry.value)}</TD>
                    </TR>
                  );
                })}
                {me && !meOnPage && (
                  <tr className="border-t-2 border-accent/30 bg-accent-subtle/60">
                    <TD>
                      <span className="flex items-center gap-2">
                        <span className="inline-flex size-7 items-center justify-center text-xs tabular-nums text-accent">
                          #{me.rank}
                        </span>
                        <Badge variant="accent" className="px-2 py-0 text-[11px]">
                          You
                        </Badge>
                      </span>
                    </TD>
                    <TD>
                      <EntryUser entry={me} />
                    </TD>
                    {showLabsColumn && (
                      <TD className="text-right tabular-nums text-text-secondary">
                        {me.labsSolved !== undefined ? formatXp(me.labsSolved) : '—'}
                      </TD>
                    )}
                    <TD className="text-right font-semibold tabular-nums">{formatXp(me.value)}</TD>
                  </tr>
                )}
              </TBody>
            </Table>
          </TableCard>

          {/* ------------------------------- Mobile ------------------------------ */}
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface md:hidden">
            {entries.map((entry) => {
              const isMe = me !== null && entry.user.username === me.user.username;
              return (
                <li
                  key={`${entry.rank}-${entry.user.username}`}
                  className={cn('flex items-center gap-3 px-4 py-3', isMe && 'bg-accent-subtle')}
                >
                  {entry.rank <= 3 ? <RankChip rank={entry.rank} /> : (
                    <span className="inline-flex size-7 shrink-0 items-center justify-center text-xs tabular-nums text-text-tertiary">
                      #{entry.rank}
                    </span>
                  )}
                  <EntryUser entry={entry} />
                  <span className="ml-auto shrink-0 text-right">
                    <span className="block text-sm font-semibold tabular-nums text-text">{formatXp(entry.value)}</span>
                    <span className="block text-[11px] text-text-tertiary">{valueLabel}</span>
                  </span>
                </li>
              );
            })}
            {me && !meOnPage && (
              <li className="flex items-center gap-3 border-t-2 border-accent/30 bg-accent-subtle px-4 py-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center text-xs font-bold tabular-nums text-accent">
                  #{me.rank}
                </span>
                <EntryUser entry={me} />
                <span className="ml-auto shrink-0 text-sm font-semibold tabular-nums text-text">
                  {formatXp(me.value)}
                </span>
              </li>
            )}
          </ul>

          {/* ----------------------------- Pagination ---------------------------- */}
          {data && data.pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Leaderboard pagination">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <span className="text-sm tabular-nums text-text-secondary">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => update({ page: String(page + 1) })}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </nav>
          )}

          {!user && (
            <p className="mt-8 text-center text-sm text-text-tertiary">
              <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
                Create a free account
              </Link>{' '}
              to appear on the leaderboard.
            </p>
          )}
        </>
      )}
    </div>
  );
}
