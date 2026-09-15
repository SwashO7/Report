import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileArchive,
  Lock,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { slugify } from '@/features/admin/slugify';
import { LAB_WORKFLOW, StatusBadge } from '@/features/admin/status-badge';
import { Button } from '@/components/ui/button';
import { FieldError, FormHint, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Skeleton } from '@/components/ui/card';
import { Modal } from '@/components/ui/overlay';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { LabAnalytics } from '@suraksha/shared';

interface AdminLabRowLite {
  id: string;
  slug: string;
  title: string;
  status: string;
}

interface AdminLessonRowLite {
  id: string;
  slug: string;
  title: string;
  status: string;
}

interface Taxonomy {
  categories: { id: string; slug: string; name: string }[];
  difficulties: { id: string; slug: string; label: string }[];
}

interface AdminLabDetail {
  lab: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    description: string;
    category: string;
    difficulty: string;
    categoryId?: string;
    difficultyId?: string;
    estimatedMinutes: number;
    xpReward: number;
    objectives: string[];
    setupInstructions: string;
    skills: string[];
    hints: { content: string }[];
    flagCaseSensitive: boolean;
    hasFlag: boolean;
    prerequisiteLabIds?: string[];
    relatedLessonIds?: string[];
    prerequisites?: { slug: string; title: string }[];
    relatedLessons?: { slug: string; title: string }[];
    visibility: string;
    status: string;
    hasPackage: boolean;
    packageVersion: string | null;
    packageSizeBytes?: number | null;
  };
}

interface LabFormState {
  title: string;
  slugTouched: boolean;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  difficultyId: string;
  estimatedMinutes: string;
  xpReward: string;
  objectivesText: string;
  setupInstructions: string;
  skillsText: string;
  hints: string[];
  prerequisiteLabIds: string[];
  relatedLessonIds: string[];
  visibility: 'public' | 'unlisted';
  flagInput: string;
  flagCaseSensitive: boolean;
  flagReplaceOpen: boolean;
}

const freshForm = (): LabFormState => ({
  title: '',
  slugTouched: false,
  slug: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  difficultyId: '',
  estimatedMinutes: '30',
  xpReward: '250',
  objectivesText: '',
  setupInstructions: '',
  skillsText: '',
  hints: [''],
  prerequisiteLabIds: [],
  relatedLessonIds: [],
  visibility: 'public',
  flagInput: '',
  flagCaseSensitive: true,
  flagReplaceOpen: false,
});

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');
const linesOf = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ------------------------------ Section shell ------------------------------ */

function Section({
  id,
  step,
  title,
  hint,
  children,
  highlight,
}: {
  id: string;
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 rounded-lg border bg-surface transition-colors', highlight ? 'border-accent' : 'border-border')}>
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-bg font-mono text-[11px] font-semibold tabular-nums text-text-secondary">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[0.95rem] font-semibold tracking-tight text-text">{title}</h2>
          {hint && <p className="mt-0.5 truncate text-xs text-text-tertiary">{hint}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function LabEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: 'config' | 'analytics' = !isNew && searchParams.get('tab') === 'analytics' ? 'analytics' : 'config';

  const setTab = (t: 'config' | 'analytics') =>
    setSearchParams(t === 'analytics' ? { tab: 'analytics' } : {}, { replace: true });

  const taxonomyQ = useQuery({
    queryKey: qk.labMeta,
    queryFn: () => api<Taxonomy>('/admin/labs/meta/taxonomy'),
  });

  const labQ = useQuery({
    queryKey: qk.adminLab(id ?? 'new'),
    queryFn: () => api<AdminLabDetail>(`/admin/labs/${id}`),
    enabled: !isNew,
  });

  const [form, setForm] = useState<LabFormState>(freshForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusTarget, setStatusTarget] = useState<string | null>(null);
  const [showFlag, setShowFlag] = useState(false);
  const loadedKey = useRef<string | null>(null);
  const [highlightPkg, setHighlightPkg] = useState(false);

  useEffect(() => {
    if (isNew) return;
    const l = labQ.data?.lab;
    if (!l) return;
    const key = `${l.id}:${l.status}:${l.packageVersion ?? ''}`;
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setForm({
      title: l.title,
      slugTouched: true,
      slug: l.slug,
      shortDescription: l.shortDescription,
      description: l.description,
      categoryId: l.categoryId ?? '',
      difficultyId: l.difficultyId ?? '',
      estimatedMinutes: String(l.estimatedMinutes),
      xpReward: String(l.xpReward),
      objectivesText: (l.objectives ?? []).join('\n'),
      setupInstructions: l.setupInstructions ?? '',
      skillsText: (l.skills ?? []).join(', '),
      hints: (l.hints ?? []).map((h) => h.content).length > 0 ? (l.hints ?? []).map((h) => h.content) : [''],
      prerequisiteLabIds: l.prerequisiteLabIds ?? [],
      relatedLessonIds: l.relatedLessonIds ?? [],
      visibility: l.visibility === 'unlisted' ? 'unlisted' : 'public',
      flagInput: '',
      flagCaseSensitive: l.flagCaseSensitive ?? true,
      flagReplaceOpen: false,
    });
  }, [labQ.data, isNew]);

  const effSlug = form.slugTouched ? form.slug : slugify(form.title);

  const patch = (p: Partial<LabFormState>) => setForm((f) => ({ ...f, ...p }));

  const saveMut = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        slug: effSlug,
        shortDescription: form.shortDescription.trim(),
        description: form.description,
        categoryId: form.categoryId,
        difficultyId: form.difficultyId,
        estimatedMinutes: Math.max(5, Math.trunc(Number(form.estimatedMinutes)) || 30),
        xpReward: Math.max(0, Math.trunc(Number(form.xpReward)) || 0),
        objectives: linesOf(form.objectivesText),
        setupInstructions: form.setupInstructions,
        skills: form.skillsText.split(',').map((s) => s.trim()).filter(Boolean),
        hints: form.hints.filter((h) => h.trim().length > 0).map((content) => ({ content: content.trim() })),
        flagCaseSensitive: form.flagCaseSensitive,
        prerequisiteLabIds: form.prerequisiteLabIds,
        relatedLessonIds: form.relatedLessonIds,
        visibility: form.visibility,
      };
      if (isNew) {
        return api<{ lab: { id: string } }>('/admin/labs', { method: 'POST', body: { ...body, flagHash: form.flagInput.trim() } });
      }
      if (form.flagReplaceOpen && form.flagInput.trim()) body.flag = form.flagInput.trim();
      return api<{ lab: { id: string } }>(`/admin/labs/${id}`, { method: 'PATCH', body });
    },
    onSuccess: (res) => {
      toast('success', isNew ? 'Lab created' : 'Lab saved');
      if (isNew) {
        // Guide the author straight to uploading the environment.
        navigate(`/admin/labs/${res.lab.id}?upload=1`, { replace: true });
      } else {
        void qc.invalidateQueries({ queryKey: qk.adminLab(id ?? '') });
      }
    },
    onError: (e) => {
      // Server-side Zod validation returns per-field `details` (path + message).
      // Map them onto the same `errors` state the client-side validate() uses,
      // so a mismatch the client missed (e.g. a stricter server rule) still
      // highlights the real field instead of a generic, actionless toast.
      let detailMessage: string | undefined;
      if (e instanceof ApiError && e.code === 'VALIDATION_ERROR' && Array.isArray(e.details)) {
        const fieldErrors: Record<string, string> = {};
        const summaries: string[] = [];
        for (const d of e.details as { path?: string; message?: string }[]) {
          if (d?.path) {
            fieldErrors[d.path] = d.message ?? 'Invalid value.';
            summaries.push(`${d.path}: ${d.message ?? 'Invalid value.'}`);
          }
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        if (summaries.length > 0) detailMessage = summaries.join(' · ');
      }
      toast('error', 'Save failed', detailMessage ?? errMsg(e));
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 2) e.title = 'Title is required (min 2 chars).';
    if (!SLUG_RE.test(effSlug)) e.slug = 'Lowercase letters, numbers and hyphens only.';
    if (!form.categoryId) e.categoryId = 'Pick a category.';
    if (!form.difficultyId) e.difficultyId = 'Pick a difficulty.';
    if (isNew && form.flagInput.trim().length < 4) e.flag = 'A plaintext flag is required (min 4 chars) to create the lab.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = () => {
    if (!validate()) {
      toast('error', 'Fix the highlighted fields before saving.');
      return;
    }
    saveMut.mutate();
  };

  const statusMut = useMutation({
    mutationFn: (to: string) => api(`/admin/labs/${id}/status`, { method: 'POST', body: { status: to } }),
    onSuccess: (_d, to) => {
      toast('success', to === 'published' ? 'Lab published' : `Status updated to ${to.replace(/_/g, ' ')}`);
      setStatusTarget(null);
      void qc.invalidateQueries({ queryKey: qk.adminLab(id ?? '') });
      void qc.invalidateQueries({ queryKey: ['admin', 'labs'] });
    },
    onError: (e) => {
      setStatusTarget(null);
      toast('error', 'Status change rejected', errMsg(e));
    },
  });

  /* Highlight the package section when arriving right after creation. */
  useEffect(() => {
    if (!searchParams.get('upload')) return;
    setHighlightPkg(true);
    // The sections render once the lab query resolves — retry until visible.
    let attempts = 24;
    const tryScroll = () => {
      const el = document.getElementById('sec-package');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts-- > 0) window.setTimeout(tryScroll, 250);
    };
    const t = window.setTimeout(tryScroll, 300);
    setSearchParams({}, { replace: true });
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lab = labQ.data?.lab;

  /* Checklist state for the rail */
  const detailsDone = form.title.trim().length >= 2 && !!form.categoryId && !!form.difficultyId && SLUG_RE.test(effSlug);
  const briefingDone = form.description.trim().length > 0 && linesOf(form.objectivesText).length > 0;
  const flagDone = isNew ? form.flagInput.trim().length >= 4 : lab?.hasFlag ?? false;
  const packageDone = !isNew && (lab?.hasPackage ?? false);

  const checklist: { label: string; done: boolean; href: string }[] = [
    { label: 'Details & rewards', done: detailsDone, href: '#sec-details' },
    { label: 'Mission brief', done: briefingDone, href: '#sec-mission' },
    { label: 'Hints configured', done: form.hints.some((h) => h.trim()), href: '#sec-hints' },
    { label: 'Flag set', done: flagDone, href: '#sec-flag' },
    { label: 'Docker package uploaded', done: packageDone, href: '#sec-package' },
  ];
  const allDone = checklist.every((c) => c.done);
  const nextStep = lab ? LAB_WORKFLOW[lab.status] : undefined;

  if (!isNew && labQ.isError) {
    return (
      <div className="space-y-4">
        <BackToLabs />
        <ErrorState description={errMsg(labQ.error)} action={<Button variant="outline" size="sm" onClick={() => void labQ.refetch()}>Try again</Button>} />
      </div>
    );
  }

  return (
    <div>
      {/* ------------------------------- Header ------------------------------- */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <BackToLabs />
        {!isNew && lab && (
          <div className="flex items-center gap-2">
            <StatusBadge status={lab.status} />
            {nextStep && (
              <Button size="sm" variant={nextStep.to === 'published' ? 'primary' : 'outline'} onClick={() => setStatusTarget(nextStep.to)}>
                {nextStep.label}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface px-5 py-4">
        <Input
          value={form.title}
          onChange={(e) => patch({ title: e.target.value })}
          aria-label="Lab title"
          placeholder={isNew ? 'New lab title' : 'Lab title'}
          className="border-transparent bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus:ring-0"
        />
        <p className="mt-1 text-sm text-text-secondary">
          {isNew
            ? 'Fill in the steps below — the checklist tracks your publishing readiness.'
            : lab
              ? `Configuration · package ${lab.hasPackage ? `v${lab.packageVersion}` : 'missing'}`
              : ''}
        </p>
      </div>

      {!isNew && (
        <TabsBar tab={tab} setTab={setTab} />
      )}

      {tab === 'analytics' && !isNew && id ? (
        <div className="mt-5">
          <LabAnalyticsPanel labId={id} />
        </div>
      ) : !isNew && (labQ.isLoading || !lab) ? (
        <div className="mt-5 space-y-4">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          {/* ----------------------------- Sections ---------------------------- */}
          <div className="space-y-4">
            <Section id="sec-details" step={1} title="Details" hint="Identity, categorization and rewards">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="lb-title">Title</Label>
                  <Input
                    id="lb-title"
                    value={form.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="Invoice Portal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="lb-slug">Slug</Label>
                  <Input
                    id="lb-slug"
                    value={effSlug}
                    onChange={(e) => patch({ slugTouched: true, slug: e.target.value })}
                    className="font-mono"
                  />
                  <FieldError message={errors.slug} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="lb-short">Short description</Label>
                  <Input
                    id="lb-short"
                    value={form.shortDescription}
                    onChange={(e) => patch({ shortDescription: e.target.value })}
                    placeholder="One-line summary shown on lab cards"
                    maxLength={300}
                  />
                </div>
                <div>
                  <Label htmlFor="lb-category">Category</Label>
                  <Select id="lb-category" value={form.categoryId} onChange={(e) => patch({ categoryId: e.target.value })}>
                    <option value="">{taxonomyQ.isLoading ? 'Loading…' : 'Select category…'}</option>
                    {(taxonomyQ.data?.categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <FieldError message={errors.categoryId} />
                </div>
                <div>
                  <Label htmlFor="lb-difficulty">Difficulty</Label>
                  <Select id="lb-difficulty" value={form.difficultyId} onChange={(e) => patch({ difficultyId: e.target.value })}>
                    <option value="">{taxonomyQ.isLoading ? 'Loading…' : 'Select difficulty…'}</option>
                    {(taxonomyQ.data?.difficulties ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </Select>
                  <FieldError message={errors.difficultyId} />
                </div>
                <div>
                  <Label htmlFor="lb-minutes">Estimated minutes</Label>
                  <Input
                    id="lb-minutes"
                    type="number"
                    min={5}
                    max={1440}
                    value={form.estimatedMinutes}
                    onChange={(e) => patch({ estimatedMinutes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lb-xp">XP reward</Label>
                  <Input id="lb-xp" type="number" min={0} max={100000} value={form.xpReward} onChange={(e) => patch({ xpReward: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="lb-visibility">Visibility</Label>
                  <Select
                    id="lb-visibility"
                    value={form.visibility}
                    onChange={(e) => patch({ visibility: e.target.value as 'public' | 'unlisted' })}
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                  </Select>
                </div>
              </div>
            </Section>

            <Section id="sec-mission" step={2} title="Mission brief" hint="What learners see before they start">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lb-desc">Mission description</Label>
                  <Textarea id="lb-desc" value={form.description} onChange={(e) => patch({ description: e.target.value })} className="min-h-[140px]" />
                </div>
                <div>
                  <Label htmlFor="lb-objectives">Objectives (one per line)</Label>
                  <Textarea
                    id="lb-objectives"
                    value={form.objectivesText}
                    onChange={(e) => patch({ objectivesText: e.target.value })}
                    className="min-h-[88px]"
                    placeholder={'Enumerate the target\nEscalate privileges\nCapture the flag'}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="lb-skills">Skills shown on the card</Label>
                    <Input id="lb-skills" value={form.skillsText} onChange={(e) => patch({ skillsText: e.target.value })} placeholder="HTTP, Authentication, Authorization" />
                    <FormHint>Keep vulnerability names out — learners discover those.</FormHint>
                  </div>
                  <div>
                    <Label htmlFor="lb-setup">Setup instructions</Label>
                    <Textarea id="lb-setup" value={form.setupInstructions} onChange={(e) => patch({ setupInstructions: e.target.value })} className="min-h-[80px]" placeholder="How learners connect to the environment…" />
                  </div>
                </div>
              </div>
            </Section>

            <Section id="sec-hints" step={3} title="Hints" hint="Progressive nudges, revealed in order at an XP cost">
              <div className="space-y-3">
                {form.hints.map((hint, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-2.5 w-5 shrink-0 text-center font-mono text-xs tabular-nums text-text-tertiary">{i + 1}</span>
                    <Textarea
                      value={hint}
                      onChange={(e) => patch({ hints: form.hints.map((h, j) => (j === i ? e.target.value : h)) })}
                      className="min-h-[64px]"
                      placeholder={`Hint ${i + 1} — conceptual guidance first`}
                      aria-label={`Hint ${i + 1}`}
                    />
                    <div className="flex shrink-0 flex-col gap-0.5 pt-1">
                      <button
                        type="button"
                        aria-label="Move hint up"
                        disabled={i === 0}
                        onClick={() => {
                          const arr = [...form.hints];
                          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                          patch({ hints: arr });
                        }}
                        className="rounded p-1 text-text-tertiary hover:bg-surface-2 hover:text-text disabled:opacity-40"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move hint down"
                        disabled={i === form.hints.length - 1}
                        onClick={() => {
                          const arr = [...form.hints];
                          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                          patch({ hints: arr });
                        }}
                        className="rounded p-1 text-text-tertiary hover:bg-surface-2 hover:text-text disabled:opacity-40"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove hint"
                        disabled={form.hints.length <= 1}
                        onClick={() => patch({ hints: form.hints.filter((_, j) => j !== i) })}
                        className="rounded p-1 text-text-tertiary hover:bg-danger-subtle hover:text-danger disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={form.hints.length >= 8}
                  onClick={() => patch({ hints: [...form.hints, ''] })}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add hint
                </Button>
              </div>
            </Section>

            <Section id="sec-access" step={4} title="Access" hint="Prerequisites and cross-links">
              <AccessCard form={form} patch={patch} currentLabId={id ?? null} />
            </Section>

            <Section id="sec-flag" step={5} title="Flag" hint="Learners submit this value to solve the lab">
              <FlagFields form={form} patch={patch} isNew={isNew} labHasFlag={lab?.hasFlag ?? false} showFlag={showFlag} setShowFlag={setShowFlag} errors={errors} />
            </Section>

            <Section
              id="sec-package"
              step={6}
              title="Docker package"
              hint="The .zip environment bundle served to learners"
              highlight={highlightPkg}
            >
              <PackageCard labId={id ?? null} hasPackage={!isNew && !!lab?.hasPackage} packageVersion={lab?.packageVersion ?? null} autoFocusUpload={highlightPkg} />
            </Section>

            {/* Sticky footer actions */}
            <div className="flex items-center justify-end gap-2 rounded-lg border border-border bg-surface px-4 py-3">
              {saveMut.isSuccess && !saveMut.isPending && (
                <span className="mr-auto inline-flex items-center gap-1.5 text-xs font-medium text-success">
                  <Check className="size-3.5" aria-hidden />
                  Saved
                </span>
              )}
              <Button variant="ghost" onClick={() => navigate('/admin/labs')}>
                Cancel
              </Button>
              <Button loading={saveMut.isPending} onClick={onSave}>
                <Save className="size-4" aria-hidden />
                {isNew ? 'Create lab' : 'Save changes'}
              </Button>
            </div>
          </div>

          {/* --------------------------- Checklist rail -------------------------- */}
          <aside className="hidden xl:block">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Publishing checklist</CardTitle>
                  <CardDescription>{allDone ? 'Everything is ready.' : `${checklist.filter((c) => !c.done).length} item(s) remaining.`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-0.5 px-3 py-2">
                  {checklist.map((c) => (
                    <button
                      key={c.label}
                      onClick={() => document.querySelector(c.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-2"
                    >
                      <CheckCircle2 className={cn('size-4 shrink-0', c.done ? 'text-success' : 'text-text-tertiary/40')} aria-hidden />
                      <span className={cn('min-w-0 flex-1 truncate', c.done ? 'text-text-secondary' : 'font-medium text-text')}>{c.label}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="px-5 py-4 text-xs leading-relaxed text-text-tertiary">
                  Publishing requires an uploaded package and a completed security review. Administrators can publish
                  directly; lab managers must route through review.
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      )}

      <Modal open={statusTarget === 'published'} onClose={() => setStatusTarget(null)} title="Publish lab" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            Publishing makes this lab visible and playable by all learners. Confirm the security review is complete.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button loading={statusMut.isPending} onClick={() => statusMut.mutate('published')}>
              Publish now
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!statusTarget && statusTarget !== 'published'} onClose={() => setStatusTarget(null)} title="Update status" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            Move this lab to <Badge variant="accent" className="capitalize">{statusTarget?.replace(/_/g, ' ')}</Badge>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button loading={statusMut.isPending} onClick={() => statusTarget && statusMut.mutate(statusTarget)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TabsBar({ tab, setTab }: { tab: 'config' | 'analytics'; setTab: (t: 'config' | 'analytics') => void }) {
  return (
    <div role="tablist" className="mt-5 flex items-center gap-5 border-b border-border">
      <button
        role="tab"
        aria-selected={tab === 'config'}
        onClick={() => setTab('config')}
        className={cn(
          '-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors',
          tab === 'config' ? 'border-accent text-text' : 'border-transparent text-text-secondary hover:text-text',
        )}
      >
        Configuration
      </button>
      <button
        role="tab"
        aria-selected={tab === 'analytics'}
        onClick={() => setTab('analytics')}
        className={cn(
          '-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors',
          tab === 'analytics' ? 'border-accent text-text' : 'border-transparent text-text-secondary hover:text-text',
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <BarChart3 className="size-4" aria-hidden />
          Analytics
        </span>
      </button>
    </div>
  );
}

function BackToLabs() {
  return (
    <Link to="/admin/labs" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text">
      <ArrowLeft className="size-4" aria-hidden />
      Labs
    </Link>
  );
}

/* -------------------------------- Flag fields ------------------------------- */

function FlagFields({
  form,
  patch,
  isNew,
  labHasFlag,
  showFlag,
  setShowFlag,
  errors,
}: {
  form: LabFormState;
  patch: (p: Partial<LabFormState>) => void;
  isNew: boolean;
  labHasFlag: boolean;
  showFlag: boolean;
  setShowFlag: (v: boolean) => void;
  errors: Record<string, string>;
}) {
  const plainEntry = isNew || !labHasFlag || form.flagReplaceOpen;
  return (
    <div className="space-y-3">
      {plainEntry ? (
        <>
          {!isNew && labHasFlag && (
            <div className="mb-3 flex items-center justify-between rounded-md border border-warning/30 bg-warning-subtle px-3.5 py-2.5 text-sm text-warning">
              <span className="inline-flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                Replacing the flag immediately invalidates old submissions.
              </span>
              <Button variant="ghost" size="sm" onClick={() => patch({ flagReplaceOpen: false, flagInput: '' })}>
                Cancel
              </Button>
            </div>
          )}
          <div>
            <Label htmlFor="lb-flag">Plaintext flag</Label>
            <div className="relative">
              <Input
                id="lb-flag"
                type={showFlag ? 'text' : 'password'}
                value={form.flagInput}
                onChange={(e) => patch({ flagInput: e.target.value })}
                className="pr-10 font-mono"
                placeholder="flag{...}"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowFlag(!showFlag)}
                aria-label={showFlag ? 'Hide flag' : 'Show flag'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-tertiary hover:bg-surface-2 hover:text-text"
              >
                {showFlag ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError message={errors.flag} />
            <FormHint>Stored as an HMAC digest — never retrievable after save.</FormHint>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2.5">
          <Badge variant="success">
            <Lock className="size-3" aria-hidden />
            Flag is set
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => patch({ flagReplaceOpen: true, flagInput: '' })}>
            Replace flag
          </Button>
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 pt-1 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={form.flagCaseSensitive}
          onChange={(e) => patch({ flagCaseSensitive: e.target.checked })}
          className="size-4 rounded border-border-strong accent-[var(--accent)]"
        />
        Flag is case-sensitive
      </label>
    </div>
  );
}

/* ------------------------------- Access card -------------------------------- */

function AccessCard({
  form,
  patch,
  currentLabId,
}: {
  form: LabFormState;
  patch: (p: Partial<LabFormState>) => void;
  currentLabId: string | null;
}) {
  const labsQ = useQuery({
    queryKey: ['admin', 'labs', 'options'],
    queryFn: () => api<{ labs: AdminLabRowLite[] }>('/admin/labs?page=1&pageSize=100'),
  });
  const lessonsQ = useQuery({
    queryKey: qk.adminLessons('options'),
    queryFn: () => api<{ lessons: AdminLessonRowLite[] }>('/admin/content/lessons?page=1&pageSize=100'),
  });

  const toggle = (key: 'prerequisiteLabIds' | 'relatedLessonIds', id: string) => {
    const list = form[key];
    patch({ [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } as Partial<LabFormState>);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <Label>Prerequisite labs ({form.prerequisiteLabIds.length})</Label>
        <div className="max-h-52 space-y-0.5 overflow-y-auto rounded-md border border-border-strong p-1.5">
          {(labsQ.data?.labs ?? []).filter((l) => l.id !== currentLabId).map((l) => (
            <label key={l.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface-2">
              <input
                type="checkbox"
                checked={form.prerequisiteLabIds.includes(l.id)}
                onChange={() => toggle('prerequisiteLabIds', l.id)}
                className="size-4 rounded border-border-strong accent-[var(--accent)]"
              />
              <span className="min-w-0 flex-1 truncate text-sm">{l.title}</span>
              <StatusBadge status={l.status} />
            </label>
          ))}
          {(labsQ.data?.labs.length ?? 0) === 0 && <p className="px-2 py-3 text-sm text-text-tertiary">No other labs yet.</p>}
        </div>
        <FormHint>Learners must solve these before starting this lab.</FormHint>
      </div>
      <div>
        <Label>Related lessons ({form.relatedLessonIds.length})</Label>
        <div className="max-h-52 space-y-0.5 overflow-y-auto rounded-md border border-border-strong p-1.5">
          {(lessonsQ.data?.lessons ?? []).map((l) => (
            <label key={l.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface-2">
              <input
                type="checkbox"
                checked={form.relatedLessonIds.includes(l.id)}
                onChange={() => toggle('relatedLessonIds', l.id)}
                className="size-4 rounded border-border-strong accent-[var(--accent)]"
              />
              <span className="min-w-0 flex-1 truncate text-sm">{l.title}</span>
            </label>
          ))}
          {(lessonsQ.data?.lessons.length ?? 0) === 0 && <p className="px-2 py-3 text-sm text-text-tertiary">No lessons found.</p>}
        </div>
        <FormHint>Shown alongside the lab as reading material.</FormHint>
      </div>
    </div>
  );
}

/* ------------------------------ Package upload ------------------------------ */

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024 / 1024).toFixed(1)} MB`;
}

function PackageCard({
  labId,
  hasPackage,
  packageVersion,
  autoFocusUpload,
}: {
  labId: string | null;
  hasPackage: boolean;
  packageVersion: string | null;
  autoFocusUpload?: boolean;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState(packageVersion ?? '1.0.0');
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (packageVersion) setVersion(packageVersion);
  }, [packageVersion]);

  useEffect(() => {
    if (autoFocusUpload) inputRef.current?.focus();
  }, [autoFocusUpload]);

  const pickFile = (f: File | null) => {
    setLocalError(null);
    if (!f) return setFile(null);
    if (!f.name.toLowerCase().endsWith('.zip')) {
      setLocalError('Only .zip archives are accepted.');
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      setLocalError('Package exceeds the 200 MB limit.');
      return;
    }
    setFile(f);
  };

  const upload = () =>
    new Promise<void>((resolve, reject) => {
      if (!labId || !file) return reject(new Error('Missing file'));
      const fd = new FormData();
      fd.append('package', file);
      fd.append('version', version.trim() || '1.0.0');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/v1/admin/labs/${labId}/package`);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) return resolve();
        let message = 'Upload failed.';
        try {
          const data = JSON.parse(xhr.responseText);
          message = data?.error?.message ?? message;
        } catch {
          /* keep default */
        }
        reject(new Error(message));
      };
      xhr.onerror = () => reject(new Error('Network error during upload.'));
      xhr.send(fd);
    });

  const mut = useMutation({
    mutationFn: upload,
    onSuccess: () => {
      toast('success', 'Package uploaded', `Version ${version.trim() || '1.0.0'} is now active.`);
      setFile(null);
      setProgress(null);
      void qc.invalidateQueries({ queryKey: qk.adminLab(labId ?? '') });
    },
    onError: (e) => {
      setProgress(null);
      toast('error', 'Upload failed', e instanceof Error ? e.message : 'Try again');
    },
  });

  if (!labId) {
    return (
      <div className="rounded-md border border-dashed border-border-strong bg-surface-2 px-4 py-8 text-center">
        <p className="text-sm font-medium text-text">Save the lab first</p>
        <p className="mt-1 text-sm text-text-tertiary">
          Click <span className="font-medium text-text">Create lab</span> below — you'll be brought right back here to
          upload the environment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <Label htmlFor="pkg-version">Package version</Label>
          <Input id="pkg-version" value={version} onChange={(e) => setVersion(e.target.value)} className="font-mono" placeholder="1.0.0" />
        </div>
        <div className="flex items-end">
          <p className="text-sm text-text-secondary">
            {hasPackage ? (
              <>
                Current version <span className="font-mono text-text">v{packageVersion ?? '?'}</span>
              </>
            ) : (
              'No package uploaded yet.'
            )}
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose or drop a .zip lab package"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          'cursor-pointer rounded-lg border border-dashed px-4 py-8 text-center transition-colors',
          dragOver ? 'border-accent bg-accent-subtle' : 'border-border-strong bg-surface-2 hover:border-accent/60 hover:bg-surface-2',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        <UploadCloud className="mx-auto size-7 text-text-tertiary" aria-hidden />
        <p className="mt-2.5 text-sm font-medium text-text">
          {file ? file.name : 'Drop your .zip here, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-text-tertiary">
          {file
            ? `${formatSize(file.size)} ready to upload${version.trim() ? ` as v${version.trim()}` : ''}`
            : 'Standard lab package: manifest.yaml, docker-compose.yml and app files · max 200 MB'}
        </p>
      </div>

      {localError && (
        <p role="alert" className="text-sm font-medium text-danger">
          {localError}
        </p>
      )}

      {progress !== null && mut.isPending && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs tabular-nums text-text-tertiary">Uploading… {progress}%</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
          <FileArchive className="size-3.5" aria-hidden />
          Stored outside the application runtime — never extracted or executed server-side.
        </p>
        <Button size="sm" loading={mut.isPending} disabled={!file} onClick={() => mut.mutate()}>
          Upload package
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------ Lab analytics ------------------------------- */

function LabAnalyticsPanel({ labId }: { labId: string }) {
  const analyticsQ = useQuery({
    queryKey: qk.adminLabAnalytics(labId),
    queryFn: () => api<LabAnalytics>(`/admin/labs/${labId}/analytics`),
  });

  if (analyticsQ.isError) {
    return (
      <ErrorState description={errMsg(analyticsQ.error)} action={<Button variant="outline" size="sm" onClick={() => void analyticsQ.refetch()}>Try again</Button>} />
    );
  }

  if (analyticsQ.isLoading || !analyticsQ.data) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const a = analyticsQ.data;
  const stats = [
    { label: 'Starts', value: a.starts.toLocaleString() },
    { label: 'Completions', value: a.completions.toLocaleString() },
    { label: 'Completion rate', value: `${Math.round(a.completionRatePct)}%` },
    { label: 'Avg time', value: a.avgMinutes != null ? `${Math.round(a.avgMinutes)} min` : '—' },
    { label: 'Median time', value: a.medianMinutes != null ? `${Math.round(a.medianMinutes)} min` : '—' },
    { label: 'First-attempt solves', value: a.firstAttemptSuccessPct != null ? `${Math.round(a.firstAttemptSuccessPct)}%` : '—' },
    { label: 'Avg hints used', value: a.hintUsageAvg != null ? a.hintUsageAvg.toFixed(1) : '—' },
    { label: 'Retry rate', value: a.retryRatePct != null ? `${Math.round(a.retryRatePct)}%` : '—' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="micro-label">{s.label}</p>
              <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        <span>Failed submissions:</span>
        <Badge variant="danger">{a.failedSubmissions.toLocaleString()}</Badge>
        {a.dropOffStage && (
          <>
            <span className="ml-3">Most common drop-off stage:</span>
            <Badge variant="warning" className="capitalize">
              {a.dropOffStage.replace(/_/g, ' ')}
            </Badge>
          </>
        )}
      </div>

      <TableCard>
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="font-semibold tracking-tight">Recent attempts</h3>
          <p className="mt-0.5 text-sm text-text-secondary">Latest learner activity on this lab</p>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Learner</TH>
              <TH>Started</TH>
              <TH>Completed</TH>
              <TH className="text-right">Submissions</TH>
              <TH className="text-right">Hints</TH>
            </TR>
          </THead>
          <TBody>
            {a.recentAttempts.length === 0 && (
              <TR>
                <TD colSpan={5} className="py-10 text-center text-text-tertiary">
                  No attempts recorded yet.
                </TD>
              </TR>
            )}
            {a.recentAttempts.map((at, i) => (
              <TR key={`${at.username}-${i}`}>
                <TD className="font-medium">@{at.username}</TD>
                <TD className="text-sm text-text-secondary">{timeOnly(at.startedAt)}</TD>
                <TD className="text-sm text-text-secondary">{at.completedAt ? timeOnly(at.completedAt) : 'In progress'}</TD>
                <TD className="text-right tabular-nums">{at.submissionCount}</TD>
                <TD className="text-right tabular-nums">{at.hintsUsed}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableCard>
    </div>
  );
}

function timeOnly(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
