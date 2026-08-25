import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Package,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { api, apiUpload, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { slugify } from '@/features/admin/slugify';
import { LAB_WORKFLOW, StatusBadge } from '@/features/admin/status-badge';
import { Button } from '@/components/ui/button';
import { FieldError, FormHint, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Skeleton } from '@/components/ui/card';
import { Modal, Tabs } from '@/components/ui/overlay';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
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
        navigate(`/admin/labs/${res.lab.id}`, { replace: true });
      } else {
        void qc.invalidateQueries({ queryKey: qk.adminLab(id ?? '') });
      }
    },
    onError: (e) => toast('error', 'Save failed', errMsg(e)),
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 2) e.title = 'Title is required (min 2 chars).';
    if (!SLUG_RE.test(effSlug)) e.slug = 'Lowercase letters, numbers and hyphens only.';
    if (!form.categoryId) e.categoryId = 'Pick a category.';
    if (!form.difficultyId) e.difficultyId = 'Pick a difficulty.';
    if (isNew && form.flagInput.trim().length < 3) e.flag = 'A plaintext flag is required to create the lab.';
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

  const lab = labQ.data?.lab;
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <Input
          value={form.title}
          onChange={(e) => patch({ title: e.target.value })}
          aria-label="Lab title"
          placeholder={isNew ? 'New lab title' : 'Lab title'}
          className="border-transparent bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus:ring-0"
        />
        <p className="mt-1 text-sm text-text-secondary">
          {isNew
            ? 'Configure the lab, then upload its package after saving.'
            : lab
              ? `Last updated configuration · package ${lab.hasPackage ? `v${lab.packageVersion}` : 'missing'}`
              : ''}
        </p>
      </div>

      <Tabs
        className="max-w-md"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'config', label: 'Configuration' },
          ...(isNew ? [] : [{ value: 'analytics' as const, label: 'Analytics' }]),
        ]}
      />

      {tab === 'analytics' && !isNew && id ? (
        <LabAnalyticsPanel labId={id} />
      ) : !isNew && (labQ.isLoading || !lab) ? (
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
              <CardDescription>Identity, categorization and rewards.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
              <div className="w-full sm:w-auto">
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
              <div className="w-full sm:w-auto">
                <Label htmlFor="lb-xp">XP reward</Label>
                <Input id="lb-xp" type="number" min={0} max={100000} value={form.xpReward} onChange={(e) => patch({ xpReward: e.target.value })} />
              </div>
              <div className="w-full sm:w-auto">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mission</CardTitle>
              <CardDescription>Briefing shown to learners before they start.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lb-desc">Mission description</Label>
                <Textarea id="lb-desc" value={form.description} onChange={(e) => patch({ description: e.target.value })} className="min-h-[160px]" />
              </div>
              <div>
                <Label htmlFor="lb-objectives">Objectives (one per line)</Label>
                <Textarea
                  id="lb-objectives"
                  value={form.objectivesText}
                  onChange={(e) => patch({ objectivesText: e.target.value })}
                  className="min-h-[96px]"
                  placeholder={'Enumerate the target\nEscalate privileges\nCapture the flag'}
                />
              </div>
              <div>
                <Label htmlFor="lb-skills">Skills (comma-separated)</Label>
                <Input id="lb-skills" value={form.skillsText} onChange={(e) => patch({ skillsText: e.target.value })} placeholder="SQL injection, Linux, privilege escalation" />
              </div>
              <div>
                <Label htmlFor="lb-setup">Setup instructions</Label>
                <Textarea id="lb-setup" value={form.setupInstructions} onChange={(e) => patch({ setupInstructions: e.target.value })} className="min-h-[110px]" placeholder="How learners connect to the environment…" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hints</CardTitle>
              <CardDescription>Progressive nudges revealed at an XP cost. Up to 8.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.hints.map((hint, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2.5 w-6 shrink-0 text-center font-mono text-xs text-text-tertiary">{i + 1}</span>
                  <Textarea
                    value={hint}
                    onChange={(e) => patch({ hints: form.hints.map((h, j) => (j === i ? e.target.value : h)) })}
                    className="min-h-[70px]"
                    placeholder={`Hint ${i + 1}`}
                    aria-label={`Hint ${i + 1}`}
                  />
                  <div className="flex shrink-0 flex-col gap-1 pt-1.5">
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
            </CardContent>
          </Card>

          <AccessCard form={form} patch={patch} currentLabId={id ?? null} />

          <Card>
            <CardHeader>
              <CardTitle>Flag</CardTitle>
              <CardDescription>Learners submit this value to solve the lab.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isNew || !lab?.hasFlag ? (
                <>
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
                        onClick={() => setShowFlag((s) => !s)}
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
                <>
                  <div className="flex items-center gap-2.5">
                    <Badge variant="success">
                      <Lock className="size-3" aria-hidden />
                      Flag is set
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => patch({ flagReplaceOpen: !form.flagReplaceOpen, flagInput: '' })}>
                      {form.flagReplaceOpen ? 'Cancel replacement' : 'Replace flag'}
                    </Button>
                  </div>
                  {form.flagReplaceOpen && (
                    <div>
                      <Label htmlFor="lb-flag-new">New plaintext flag</Label>
                      <div className="relative">
                        <Input
                          id="lb-flag-new"
                          type={showFlag ? 'text' : 'password'}
                          value={form.flagInput}
                          onChange={(e) => patch({ flagInput: e.target.value })}
                          className="pr-10 font-mono"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFlag((s) => !s)}
                          aria-label={showFlag ? 'Hide flag' : 'Show flag'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-tertiary hover:bg-surface-2 hover:text-text"
                        >
                          {showFlag ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <FormHint>Stored as an HMAC digest — never retrievable after save.</FormHint>
                    </div>
                  )}
                </>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={form.flagCaseSensitive}
                  onChange={(e) => patch({ flagCaseSensitive: e.target.checked })}
                  className="size-4 rounded border-border-strong accent-[var(--accent)]"
                />
                Flag is case-sensitive
              </label>
            </CardContent>
          </Card>

          <PackageCard labId={id ?? null} hasPackage={!isNew && !!lab?.hasPackage} packageVersion={lab?.packageVersion ?? null} />

          <div className="flex items-center justify-end gap-2 rounded-xl border border-border bg-surface p-4 shadow-xs">
            <Button variant="ghost" onClick={() => navigate('/admin/labs')}>
              Cancel
            </Button>
            <Button loading={saveMut.isPending} onClick={onSave}>
              <Save className="size-4" aria-hidden />
              {isNew ? 'Create lab' : 'Save changes'}
            </Button>
          </div>
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

function BackToLabs() {
  return (
    <Link to="/admin/labs" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text">
      <ArrowLeft className="size-4" aria-hidden />
      Labs
    </Link>
  );
}

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
    <Card>
      <CardHeader>
        <CardTitle>Access</CardTitle>
        <CardDescription>Gating and cross-links between labs and lessons.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-2">
        <div>
          <Label>Prerequisite labs ({form.prerequisiteLabIds.length})</Label>
          <div className="max-h-52 space-y-0.5 overflow-y-auto rounded-lg border border-border p-1.5">
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
          <div className="max-h-52 space-y-0.5 overflow-y-auto rounded-lg border border-border p-1.5">
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
      </CardContent>
    </Card>
  );
}

function PackageCard({
  labId,
  hasPackage,
  packageVersion,
}: {
  labId: string | null;
  hasPackage: boolean;
  packageVersion: string | null;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState(packageVersion ?? '1.0.0');

  useEffect(() => {
    if (packageVersion) setVersion(packageVersion);
  }, [packageVersion]);

  const mut = useMutation({
    mutationFn: () => {
      if (!labId || !file) throw new Error('Missing file');
      const fd = new FormData();
      fd.append('package', file);
      fd.append('version', version.trim() || '1.0.0');
      return apiUpload(`/admin/labs/${labId}/package`, fd);
    },
    onSuccess: () => {
      toast('success', 'Package uploaded', `Version ${version.trim() || '1.0.0'} is now active.`);
      setFile(null);
      void qc.invalidateQueries({ queryKey: qk.adminLab(labId ?? '') });
    },
    onError: (e) => toast('error', 'Upload failed', errMsg(e)),
  });

  if (!labId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Package className="size-4 text-text-tertiary" aria-hidden />
              Package
            </span>
          </CardTitle>
          <CardDescription>The .zip environment bundle served to learners.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-dashed border-border-strong bg-surface-2 px-4 py-6 text-center text-sm text-text-secondary">
            Save the lab first, then upload its package here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Package className="size-4 text-text-tertiary" aria-hidden />
            Package
          </span>
        </CardTitle>
        <CardDescription>
          {hasPackage ? `Current version v${packageVersion ?? '?'}.` : 'No package uploaded yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
          <div>
            <Label htmlFor="pkg-version">Package version</Label>
            <Input id="pkg-version" value={version} onChange={(e) => setVersion(e.target.value)} className="font-mono" placeholder="1.0.0" />
          </div>
          <div>
            <Label htmlFor="pkg-file">Package file (.zip)</Label>
            <input
              id="pkg-file"
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-3 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text hover:file:bg-border"
            />
          </div>
        </div>
        {file && (
          <p className="text-sm text-text-secondary">
            Selected: <span className="font-medium text-text">{file.name}</span> ·{' '}
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
        <div>
          <Button size="sm" loading={mut.isPending} disabled={!file} onClick={() => mut.mutate()}>
            <Upload className="size-4" aria-hidden />
            Upload package
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
          <Skeleton key={i} className="h-24 rounded-xl" />
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
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{s.label}</p>
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
