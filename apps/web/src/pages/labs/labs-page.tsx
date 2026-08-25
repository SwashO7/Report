import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useSeo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/card';
import { Input, Label, Select } from '@/components/ui/input';
import { LabCardView } from '@/features/labs/lab-card';
import type { Pagination } from '@suraksha/shared';

interface LabsResponse {
  labs: import('@suraksha/shared').LabCard[];
  pagination: Pagination;
}

interface LabMeta {
  categories: { slug: string; name: string; description: string; labCount: number }[];
  difficulties: { slug: string; label: string; sortOrder: number }[];
}

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'xp', label: 'Highest XP' },
  { value: 'difficulty', label: 'Easiest first' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'solved', label: 'Solved' },
];

export default function LabsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  useSeo(
    'Labs — Suraksha Labs',
    'Browse hands-on cybersecurity labs by category and difficulty. Download real lab environments, capture flags, and earn XP.',
  );

  /* --------------------------- URL-driven state --------------------------- */

  const category = searchParams.get('category') ?? '';
  const difficulty = searchParams.get('difficulty') ?? '';
  const status = searchParams.get('status') ?? 'all';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const qParam = searchParams.get('q') ?? '';

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  };

  /* ------------------------- Debounced search input ------------------------ */

  const [searchInput, setSearchInput] = useState(qParam);

  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  useEffect(() => {
    if (searchInput === qParam) return;
    const t = window.setTimeout(() => update({ q: searchInput }), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* -------------------------------- Queries ------------------------------- */

  const metaQuery = useQuery({
    queryKey: qk.labMeta,
    queryFn: () => api<LabMeta>('/labs/meta'),
    staleTime: 300_000,
  });

  const listParams = new URLSearchParams(searchParams);
  listParams.set('pageSize', String(PAGE_SIZE));
  const qs = listParams.toString();

  const labsQuery = useQuery({
    queryKey: qk.labs(qs),
    queryFn: () => api<LabsResponse>(`/labs?${qs}`),
    placeholderData: (prev) => prev,
  });

  const { data, isLoading, isError, refetch } = labsQuery;
  const labs = data?.labs ?? [];
  const pagination = data?.pagination;

  const clearFilters = () => setSearchParams(new URLSearchParams());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">Labs</h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          Real environments, real flags. Pick a lab, download the package, and prove your skills.
        </p>
      </header>

      {/* ------------------------------- Toolbar ------------------------------ */}
      <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem_11rem]">
        <div>
          <Label htmlFor="lab-search" className="sr-only">
            Search labs
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
            <Input
              id="lab-search"
              type="search"
              placeholder="Search labs…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="lab-category" className="lg:sr-only">
            Category
          </Label>
          <Select id="lab-category" value={category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All categories</option>
            {(metaQuery.data?.categories ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.labCount})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="lab-difficulty" className="lg:sr-only">
            Difficulty
          </Label>
          <Select id="lab-difficulty" value={difficulty} onChange={(e) => update({ difficulty: e.target.value })}>
            <option value="">All difficulties</option>
            {(metaQuery.data?.difficulties ?? [])
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label}
                </option>
              ))}
          </Select>
        </div>

        {user && (
          <div>
            <Label htmlFor="lab-status" className="lg:sr-only">
              Status
            </Label>
            <Select id="lab-status" value={status} onChange={(e) => update({ status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="lab-sort" className="lg:sr-only">
            Sort
          </Label>
          <Select id="lab-sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* ------------------------------- Results ------------------------------ */}
      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border bg-surface p-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mt-10">
          <EmptyState
            icon={SlidersHorizontal}
            title="Could not load labs"
            description="Something went wrong while fetching labs. Check your connection and try again."
            action={
              <Button variant="outline" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : labs.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Search}
            title="No labs match your filters"
            description="Try a different search term or loosen a filter — new labs are added regularly."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-text-tertiary" aria-live="polite">
            {pagination && pagination.total > 0 && (
              <>
                {pagination.total} lab{pagination.total === 1 ? '' : 's'}
                {qParam && <> matching “{qParam}”</>}
              </>
            )}
          </p>

          <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {labs.map((lab) => (
              <LabCardView key={lab.id} lab={lab} />
            ))}
          </div>

          {/* ----------------------------- Pagination ---------------------------- */}
          {pagination && pagination.totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-4"
              aria-label="Labs pagination"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => update({ page: String(page - 1) })}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <span className="text-sm tabular-nums text-text-secondary">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => update({ page: String(page + 1) })}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
