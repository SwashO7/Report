import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { LabCard, Pagination } from '@suraksha/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Skeleton } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { LabRowList } from '@/features/labs/lab-card';

interface LabsResponse { labs: LabCard[]; pagination: Pagination }
interface LabMeta { categories: { slug: string; name: string; description: string; labCount: number }[]; difficulties: { slug: string; label: string; sortOrder: number }[] }
const PAGE_SIZE = 20;

export default function LabsV2() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const difficulty = params.get('difficulty') ?? '';
  const status = params.get('status') ?? 'all';
  const sort = params.get('sort') ?? 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const query = params.get('q') ?? '';
  const [search, setSearch] = useState(query);
  const hasFilters = Boolean(category || difficulty || query || sort !== 'newest' || (user && status !== 'all'));
  useSeo('Cybersecurity labs | Suraksha Labs', 'Run local cybersecurity labs, capture flags, and build practical evidence across networking, Linux, web security, and recon.');

  const update = (patch: Record<string, string | null>) => { const next = new URLSearchParams(params); Object.entries(patch).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); if (!('page' in patch)) next.delete('page'); setParams(next); };
  useEffect(() => setSearch(query), [query]);
  useEffect(() => { if (search === query) return; const timer = window.setTimeout(() => update({ q: search }), 300); return () => window.clearTimeout(timer); }, [search]);

  const meta = useQuery({ queryKey: qk.labMeta, queryFn: () => api<LabMeta>('/labs/meta'), staleTime: 300_000 });
  const listParams = new URLSearchParams(params); listParams.set('pageSize', String(PAGE_SIZE));
  const labsQuery = useQuery({ queryKey: qk.labs(listParams.toString()), queryFn: () => api<LabsResponse>(`/labs?${listParams}`), placeholderData: (previous) => previous });
  const labs = labsQuery.data?.labs ?? [];
  const pagination = labsQuery.data?.pagination;
  const quickStart = labs.find((lab) => !lab.solved && !lab.inProgress) ?? labs.find((lab) => lab.inProgress) ?? labs[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header><p className="signal-label"><Sparkles className="size-3.5" /> Hands-on missions</p><h1 className="page-title mt-4">Lab fieldwork</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">Run a contained environment on your machine, investigate the behavior, and capture the flag.</p></header>

      {quickStart && !hasFilters && <section className="signal-panel mt-8 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6"><div className="min-w-0 flex-1"><p className="signal-label">Best place to start</p><h2 className="mt-3 text-xl font-semibold">{quickStart.title}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">{quickStart.shortDescription}</p><div className="mt-3 flex flex-wrap gap-2"><Badge>{quickStart.category.name}</Badge><Badge variant="accent">{quickStart.difficulty.label}</Badge><Badge variant="outline">+{quickStart.xpReward} XP</Badge></div></div><Link to={`/labs/${quickStart.slug}`}><Button className="w-full sm:w-auto">Open mission <ArrowRight className="size-4" /></Button></Link></section>}

      <section className="mt-8" aria-label="Lab filters">
        <div className="flex gap-2 overflow-x-auto pb-2"><button onClick={() => update({ category: null })} className={category ? 'shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary' : 'shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground'}>All missions</button>{(meta.data?.categories ?? []).map((item) => <button key={item.slug} onClick={() => update({ category: item.slug })} className={category === item.slug ? 'shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground' : 'shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:border-border-strong'}>{item.name} <span className="ml-1 font-mono text-[10px] opacity-70">{item.labCount}</span></button>)}</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(15rem,1fr)_repeat(3,auto)_auto]">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" /><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by mission or skill" aria-label="Search labs" className="pl-9" /></div>
          <Select aria-label="Difficulty" value={difficulty} onChange={(event) => update({ difficulty: event.target.value || null })} className="sm:w-40"><option value="">Any difficulty</option>{(meta.data?.difficulties ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</Select>
          {user && <Select aria-label="Progress status" value={status} onChange={(event) => update({ status: event.target.value })} className="sm:w-36"><option value="all">Any status</option><option value="unsolved">Not started</option><option value="in_progress">In progress</option><option value="solved">Solved</option></Select>}
          <Select aria-label="Sort labs" value={sort} onChange={(event) => update({ sort: event.target.value })} className="sm:w-40"><option value="newest">Newest</option><option value="popular">Most solved</option><option value="difficulty">Easiest first</option><option value="xp">Highest XP</option></Select>
          {hasFilters && <Button variant="ghost" onClick={() => setParams(new URLSearchParams())}>Clear</Button>}
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between"><p className="signal-label">Mission index</p>{pagination && <span className="font-mono text-xs text-text-tertiary">{pagination.total} result{pagination.total === 1 ? '' : 's'}</span>}</div>
      {labsQuery.isLoading ? <div className="mt-4 space-y-2">{Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-xl" />)}</div> : labsQuery.isError ? <div className="mt-8"><EmptyState icon={SlidersHorizontal} title="Labs did not load" description="Check your connection, then try again." action={<Button variant="outline" onClick={() => void labsQuery.refetch()}>Try again</Button>} /></div> : labs.length === 0 ? <div className="mt-8"><EmptyState icon={Search} title="No missions match" description="Clear one or more filters to see more labs." action={hasFilters ? <Button variant="outline" onClick={() => setParams(new URLSearchParams())}>Clear filters</Button> : undefined} /></div> : <div className="mt-4"><LabRowList labs={labs} /></div>}

      {pagination && pagination.totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Lab pages"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}><ChevronLeft className="size-4" />Previous</Button><span className="font-mono text-xs text-text-tertiary">{page} / {pagination.totalPages}</span><Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => update({ page: String(page + 1) })}>Next<ChevronRight className="size-4" /></Button></nav>}
    </div>
  );
}
