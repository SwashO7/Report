import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, PencilLine, Plus } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { cn, formatXp } from '@/lib/utils';
import { slugify } from '@/features/admin/slugify';
import { Button } from '@/components/ui/button';
import { FieldError, FormHint, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Badge, type BadgeVariant, Card, ErrorState, Skeleton } from '@/components/ui/card';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';

interface AchievementCriteria {
  event: string;
  metric: string;
  threshold: number;
  categorySlug?: string | null;
  maxHints?: number | null;
  withinMinutes?: number | null;
}

interface AdminAchievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  criteria: AchievementCriteria;
  xpReward: number;
  isVisible: boolean;
  sortOrder: number;
}

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
const EVENTS = ['lab_solved', 'lesson_completed', 'exercise_completed', 'login_streak', 'xp_earned'] as const;
const METRICS = ['count', 'days', 'total'] as const;

const RARITY_VARIANT: Record<string, BadgeVariant> = {
  common: 'outline',
  uncommon: 'success',
  rare: 'accent',
  epic: 'warning',
  legendary: 'danger',
};

const RARITY_MEDAL: Record<string, string> = {
  common: 'bg-surface-3 text-text-secondary',
  uncommon: 'bg-success-subtle text-success',
  rare: 'bg-accent-subtle text-accent',
  epic: 'bg-warning-subtle text-warning',
  legendary: 'bg-danger-subtle text-danger',
};

const EVENT_LABELS: Record<string, (n: number) => string> = {
  lab_solved: (n) => `Solve ${n} lab${n === 1 ? '' : 's'}`,
  lesson_completed: (n) => `Complete ${n} lesson${n === 1 ? '' : 's'}`,
  exercise_completed: (n) => `Complete ${n} exercise${n === 1 ? '' : 's'}`,
  login_streak: (n) => `${n}-day activity streak`,
  xp_earned: (n) => `Earn ${formatXp(n)} XP`,
};

function criteriaSummary(c: AchievementCriteria): string {
  const bits: string[] = [];
  const fn = EVENT_LABELS[c.event];
  if (fn && typeof c.threshold === 'number') bits.push(fn(c.threshold));
  else bits.push([c.event.replace(/_/g, ' '), c.metric !== 'count' ? c.metric.replace(/_/g, ' ') : '', c.threshold].filter(Boolean).join(' '));
  if (c.categorySlug) bits.push(`in ${c.categorySlug}`);
  if (c.maxHints != null) bits.push(`≤ ${c.maxHints} hints`);
  if (c.withinMinutes != null) bits.push(`within ${c.withinMinutes} min`);
  return bits.join(' · ');
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

export default function AdminAchievements() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const achievementsQ = useQuery({
    queryKey: qk.adminAchievements,
    queryFn: () => api<{ achievements: AdminAchievement[] }>('/admin/achievements'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [initial, setInitial] = useState<AdminAchievement | null>(null);

  const toggleMut = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      api(`/admin/achievements/${id}`, { method: 'PATCH', body: { isVisible } }),
    onSuccess: () => {
      toast('success', 'Visibility updated');
      void qc.invalidateQueries({ queryKey: qk.adminAchievements });
    },
    onError: (e) => toast('error', 'Update failed', errMsg(e)),
  });

  const rows = achievementsQ.data?.achievements ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
          <p className="mt-1 text-sm text-text-secondary">Define the badges learners unlock through activity.</p>
        </div>
        <Button
          onClick={() => {
            setInitial(null);
            setModalOpen(true);
          }}
        >
          <Plus className="size-4" aria-hidden />
          New achievement
        </Button>
      </div>

      {achievementsQ.isError ? (
        <ErrorState
          description={errMsg(achievementsQ.error)}
          action={
            <Button variant="outline" size="sm" onClick={() => void achievementsQ.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH>Achievement</TH>
                <TH>Rarity</TH>
                <TH>Category</TH>
                <TH>Criteria</TH>
                <TH className="text-right">XP</TH>
                <TH>Visible</TH>
                <TH className="w-12" />
              </TR>
            </THead>
            <TBody>
              {achievementsQ.isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TR key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TD key={j}>
                        <Skeleton className="h-4 w-full max-w-24" />
                      </TD>
                    ))}
                  </TR>
                ))}
              {!achievementsQ.isLoading && rows.length === 0 && (
                <TR>
                  <TD colSpan={7} className="py-12 text-center text-text-tertiary">
                    No achievements defined yet.
                  </TD>
                </TR>
              )}
              {rows.map((a) => (
                <TR key={a.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', RARITY_MEDAL[a.rarity] ?? RARITY_MEDAL.common)}>
                        <Award className="size-4.5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{a.title}</p>
                        <p className="truncate font-mono text-xs text-text-tertiary">{a.slug}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={RARITY_VARIANT[a.rarity] ?? 'outline'} className="capitalize">
                      {a.rarity}
                    </Badge>
                  </TD>
                  <TD className="text-sm capitalize text-text-secondary">{a.category.replace(/_/g, ' ')}</TD>
                  <TD className="max-w-64 truncate text-sm text-text-secondary">{criteriaSummary(a.criteria)}</TD>
                  <TD className="text-right font-medium tabular-nums">{formatXp(a.xpReward)}</TD>
                  <TD>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={a.isVisible}
                      aria-label={`Toggle visibility for ${a.title}`}
                      disabled={toggleMut.isPending}
                      onClick={() => toggleMut.mutate({ id: a.id, isVisible: !a.isVisible })}
                      className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
                        a.isVisible ? 'bg-accent' : 'bg-border-strong',
                      )}
                    >
                      <span className={cn('ml-0.5 inline-block size-4 rounded-full bg-white shadow transition-transform', a.isVisible && 'translate-x-4')} />
                    </button>
                  </TD>
                  <TD>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${a.title}`}
                      onClick={() => {
                        setInitial(a);
                        setModalOpen(true);
                      }}
                    >
                      <PencilLine className="size-4" aria-hidden />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableCard>
      )}

      <AchievementModal open={modalOpen} initial={initial} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function AchievementModal({ open, initial, onClose }: { open: boolean; initial: AdminAchievement | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const taxonomyQ = useQuery({
    queryKey: qk.labMeta,
    queryFn: () => api<{ categories: { id: string; slug: string; name: string }[] }>('/admin/labs/meta/taxonomy'),
    enabled: open,
  });

  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('labs');
  const [rarity, setRarity] = useState<string>('common');
  const [event, setEvent] = useState<string>('lab_solved');
  const [metric, setMetric] = useState<string>('count');
  const [threshold, setThreshold] = useState('1');
  const [categorySlug, setCategorySlug] = useState('');
  const [maxHints, setMaxHints] = useState('');
  const [withinMinutes, setWithinMinutes] = useState('');
  const [xpReward, setXpReward] = useState('100');
  const [sortOrder, setSortOrder] = useState('0');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setSlug(initial.slug);
      setTitle(initial.title);
      setDescription(initial.description);
      setIcon(initial.icon);
      setCategory(initial.category);
      setRarity(initial.rarity);
      setEvent(initial.criteria?.event ?? 'lab_solved');
      setMetric(initial.criteria?.metric ?? 'count');
      setThreshold(String(initial.criteria?.threshold ?? 1));
      setCategorySlug(initial.criteria?.categorySlug ?? '');
      setMaxHints(initial.criteria?.maxHints != null ? String(initial.criteria.maxHints) : '');
      setWithinMinutes(initial.criteria?.withinMinutes != null ? String(initial.criteria.withinMinutes) : '');
      setXpReward(String(initial.xpReward));
      setSortOrder(String(initial.sortOrder));
      setIsVisible(initial.isVisible);
    } else {
      setSlug('');
      setTitle('');
      setDescription('');
      setIcon('');
      setCategory('labs');
      setRarity('common');
      setEvent('lab_solved');
      setMetric('count');
      setThreshold('1');
      setCategorySlug('');
      setMaxHints('');
      setWithinMinutes('');
      setXpReward('100');
      setSortOrder('0');
      setIsVisible(true);
    }
  }, [open, initial]);

  const mut = useMutation({
    mutationFn: () => {
      const criteria: Record<string, unknown> = {
        event,
        metric,
        threshold: Math.trunc(Number(threshold)) || 0,
      };
      if (categorySlug) criteria.categorySlug = categorySlug;
      if (maxHints.trim()) criteria.maxHints = Math.trunc(Number(maxHints)) || 0;
      if (withinMinutes.trim()) criteria.withinMinutes = Math.trunc(Number(withinMinutes)) || 0;
      const body = {
        title: title.trim(),
        description,
        icon: icon.trim(),
        category: category.trim(),
        rarity,
        criteria,
        xpReward: Math.trunc(Number(xpReward)) || 0,
        isVisible,
        sortOrder: Math.trunc(Number(sortOrder)) || 0,
      };
      if (initial) return api(`/admin/achievements/${initial.id}`, { method: 'PATCH', body });
      return api('/admin/achievements', { method: 'POST', body: { ...body, slug } });
    },
    onSuccess: () => {
      toast('success', initial ? 'Achievement updated' : 'Achievement created');
      void qc.invalidateQueries({ queryKey: qk.adminAchievements });
      onClose();
    },
    onError: (e) => toast('error', 'Save failed', errMsg(e)),
  });

  const valid = title.trim().length >= 2 && (initial || slugify(slug).length >= 2);

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit achievement' : 'New achievement'} size="lg">
      <div className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ac-title">Title</Label>
            <Input id="ac-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. First Blood" />
          </div>
          <div>
            <Label htmlFor="ac-slug">Slug</Label>
            <Input
              id="ac-slug"
              value={initial ? initial.slug : slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={!!initial}
              className="font-mono"
              placeholder={initial ? undefined : 'first-blood'}
            />
            {!initial && <FieldError message={slug.length > 0 && slugify(slug).length < 2 ? 'Enter a valid slug.' : undefined} />}
          </div>
        </div>
        <div>
          <Label htmlFor="ac-desc">Description</Label>
          <Textarea id="ac-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[70px]" placeholder="Shown in the achievement tooltip and share cards." />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ac-icon">Icon</Label>
            <Input id="ac-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="shield" />
            <FormHint>Icon key stored on the achievement (rendered as a medallion on profiles).</FormHint>
          </div>
          <div>
            <Label htmlFor="ac-category">Category</Label>
            <Input id="ac-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="labs" />
          </div>
        </div>

        <div className="rounded-lg border border-border p-3.5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">Criteria</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="ac-event">Event</Label>
              <Select id="ac-event" value={event} onChange={(e) => setEvent(e.target.value)}>
                {EVENTS.map((ev) => (
                  <option key={ev} value={ev}>
                    {ev.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ac-metric">Metric</Label>
              <Select id="ac-metric" value={metric} onChange={(e) => setMetric(e.target.value)}>
                {METRICS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ac-threshold">Threshold</Label>
              <Input id="ac-threshold" type="number" min={0} value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ac-catslug">Lab category filter</Label>
              <Select id="ac-catslug" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
                <option value="">Any category</option>
                {(taxonomyQ.data?.categories ?? []).map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ac-maxhints">Max hints (optional)</Label>
              <Input id="ac-maxhints" type="number" min={0} value={maxHints} onChange={(e) => setMaxHints(e.target.value)} placeholder="—" />
            </div>
            <div>
              <Label htmlFor="ac-within">Within minutes (optional)</Label>
              <Input id="ac-within" type="number" min={0} value={withinMinutes} onChange={(e) => setWithinMinutes(e.target.value)} placeholder="—" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label htmlFor="ac-rarity">Rarity</Label>
            <Select id="ac-rarity" value={rarity} onChange={(e) => setRarity(e.target.value)}>
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ac-xp">XP reward</Label>
            <Input id="ac-xp" type="number" min={0} max={100000} value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ac-sort">Sort order</Label>
            <Input id="ac-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div>
            <Label>Visibility</Label>
            <button
              type="button"
              role="switch"
              aria-checked={isVisible}
              aria-label="Toggle visible"
              onClick={() => setIsVisible((v) => !v)}
              className={cn(
                'relative mt-1 inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors',
                isVisible ? 'bg-accent' : 'bg-border-strong',
              )}
            >
              <span className={cn('ml-0.5 inline-block size-5 rounded-full bg-white shadow transition-transform', isVisible && 'translate-x-4.5')} />
            </button>
          </div>
        </div>

        <Card className="bg-surface-2">
          <div className="flex items-center gap-3 p-3.5">
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', RARITY_MEDAL[rarity] ?? RARITY_MEDAL.common)}>
              <Award className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title.trim() || 'Achievement preview'}</p>
              <p className="truncate text-xs text-text-secondary">{criteriaSummary({ event, metric, threshold: Number(threshold) || 0, categorySlug: categorySlug || null, maxHints: maxHints ? Number(maxHints) : null, withinMinutes: withinMinutes ? Number(withinMinutes) : null })}</p>
            </div>
            <Badge variant={RARITY_VARIANT[rarity] ?? 'outline'} className="ml-auto capitalize">
              {rarity}
            </Badge>
          </div>
        </Card>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mut.isPending} disabled={!valid} onClick={() => mut.mutate()}>
            {initial ? 'Save changes' : 'Create achievement'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
