import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronRight,
  Layers,
  MoreVertical,
  PencilLine,
  Plus,
  Search,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { slugify } from '@/features/admin/slugify';
import { StatusBadge } from '@/features/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea, FormHint } from '@/components/ui/input';
import { Badge, Card, CardContent, EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { Dropdown, DropdownItem, Modal, Tabs, Tooltip } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';

interface AdminModule {
  id: string;
  slug: string;
  title: string;
  description?: string;
  published: boolean;
  sortOrder: number;
  lessonCount?: number;
}

interface AdminPath {
  id: string;
  slug: string;
  name: string;
  levelNumber: number;
  description: string;
  icon?: string | null;
  published: boolean;
  sortOrder: number;
  moduleCount: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
  modules?: AdminModule[];
}

interface AdminLessonRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  version: number;
  moduleId: string;
  moduleTitle: string;
  pathName: string;
  estimatedMinutes: number;
  updatedAt: string;
  publishedAt: string | null;
  viewCount: number;
  completionCount: number;
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'ml-0.5 inline-block size-4 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4',
        )}
      />
    </button>
  );
}

/** Module list for a path: prefers embedded data, falls back to the modules endpoint. */
function useModules(pathId: string | null, embedded: AdminModule[] | undefined) {
  const fallback = useQuery({
    queryKey: ['admin', 'modules', pathId ?? 'none'],
    queryFn: () => api<{ modules: AdminModule[] }>(`/admin/content/modules?pathId=${pathId}`),
    enabled: !!pathId && !embedded,
  });
  return embedded ?? fallback.data?.modules ?? [];
}

export default function AdminContent() {
  const [tab, setTab] = useState<'paths' | 'lessons'>('paths');
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Learning content</h1>
        <p className="mt-1 text-sm text-text-secondary">Organize paths, modules and lessons.</p>
      </div>
      <Tabs
        className="mb-5 max-w-md"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'paths', label: 'Paths & modules' },
          { value: 'lessons', label: 'Lessons' },
        ]}
      />
      {tab === 'paths' ? <PathsTab /> : <LessonsTab />}
    </div>
  );
}

/* ------------------------------ Paths & modules ----------------------------- */

function PathsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const pathsQ = useQuery({
    queryKey: qk.adminPaths,
    queryFn: () => api<{ paths: AdminPath[] }>('/admin/content/paths'),
  });
  const paths = pathsQ.data?.paths ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && paths.length > 0) setSelectedId(paths[0].id);
  }, [selectedId, pathsQ.data]);
  const selected = paths.find((p) => p.id === selectedId) ?? null;
  const modules = useModules(selected?.id ?? null, selected?.modules);

  const [newPathOpen, setNewPathOpen] = useState(false);
  const [addModuleOpen, setAddModuleOpen] = useState(false);

  const invalidateContent = () => {
    void qc.invalidateQueries({ queryKey: qk.adminPaths });
    void qc.invalidateQueries({ queryKey: ['admin', 'modules'] });
  };

  const patchPath = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api(`/admin/content/paths/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      toast('success', 'Path updated');
      invalidateContent();
    },
    onError: (e) => toast('error', 'Update failed', errMsg(e)),
  });

  const patchModule = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api(`/admin/content/modules/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      toast('success', 'Module updated');
      invalidateContent();
    },
    onError: (e) => toast('error', 'Update failed', errMsg(e)),
  });

  if (pathsQ.isError) {
    return (
      <ErrorState
        description={errMsg(pathsQ.error)}
        action={
          <Button variant="outline" size="sm" onClick={() => void pathsQ.refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setNewPathOpen(true)}>
          <Plus className="size-4" aria-hidden />
          New path
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          {pathsQ.isLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
          {!pathsQ.isLoading && paths.length === 0 && (
            <EmptyState icon={BookOpen} title="No paths yet" description="Create your first learning path to get started." />
          )}
          {paths.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={cn(
                'w-full rounded-lg border bg-surface p-4 text-left transition-colors',
                p.id === selectedId ? 'border-accent ring-2 ring-ring/25' : 'border-border hover:border-border-strong',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-sm font-bold text-accent">
                    {p.levelNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate font-mono text-xs text-text-tertiary">{p.slug}</p>
                  </div>
                </div>
                <span onClick={(e) => e.stopPropagation()}>
                  <Toggle
                    checked={p.published}
                    label={`Toggle published for ${p.name}`}
                    onChange={(v) => patchPath.mutate({ id: p.id, body: { published: v } })}
                  />
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{p.description || 'No description'}</p>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-text-tertiary">
                <Badge variant="outline">{p.moduleCount} modules</Badge>
                <Badge variant="outline">{p.lessonCount} lessons</Badge>
                {!p.published && <Badge variant="warning">Hidden</Badge>}
              </div>
            </button>
          ))}
        </div>

        <Card>
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold tracking-tight">{selected.name}</h3>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    Modules Â· updated {timeAgo(selected.updatedAt)}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setAddModuleOpen(true)}>
                  <Plus className="size-4" aria-hidden />
                  Add module
                </Button>
              </div>
              <CardContent className="divide-y divide-border p-0">
                {modules.length === 0 && (
                  <p className="px-5 py-10 text-center text-sm text-text-tertiary">No modules in this path yet.</p>
                )}
                {modules.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Layers className="size-4 shrink-0 text-text-tertiary" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <p className="truncate font-mono text-xs text-text-tertiary">{m.slug}</p>
                    </div>
                    {m.lessonCount != null && (
                      <Tooltip label={`${m.lessonCount} lessons`}>
                        <Badge variant="outline">{m.lessonCount}</Badge>
                      </Tooltip>
                    )}
                    <Badge variant="outline" className="tabular-nums">
                      #{m.sortOrder}
                    </Badge>
                    <Toggle
                      checked={m.published}
                      label={`Toggle published for ${m.title}`}
                      onChange={(v) => patchModule.mutate({ id: m.id, body: { published: v } })}
                    />
                  </div>
                ))}
              </CardContent>
            </>
          ) : (
            <CardContent>
              <EmptyState icon={BookOpen} title="Select a path" description="Pick a path on the left to manage its modules." />
            </CardContent>
          )}
        </Card>
      </div>

      <NewPathModal open={newPathOpen} onClose={() => setNewPathOpen(false)} onCreated={invalidateContent} nextSort={paths.length + 1} />
      {selected && (
        <AddModuleModal open={addModuleOpen} onClose={() => setAddModuleOpen(false)} onCreated={invalidateContent} path={selected} />
      )}
    </div>
  );
}

function NewPathModal({
  open,
  onClose,
  onCreated,
  nextSort,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  nextSort: number;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState('');
  const [levelNumber, setLevelNumber] = useState(String(nextSort));
  const [description, setDescription] = useState('');
  const effSlug = slugTouched ? slug : slugify(name);

  const mut = useMutation({
    mutationFn: () =>
      api('/admin/content/paths', {
        method: 'POST',
        body: { name, slug: effSlug, levelNumber: Number(levelNumber) || 1, description },
      }),
    onSuccess: () => {
      toast('success', 'Path created');
      void qc.invalidateQueries({ queryKey: qk.adminPaths });
      setName('');
      setSlug('');
      setSlugTouched(false);
      setDescription('');
      onCreated();
      onClose();
    },
    onError: (e) => toast('error', 'Could not create path', errMsg(e)),
  });

  return (
    <Modal open={open} onClose={onClose} title="New learning path">
      <div className="space-y-4 p-5">
        <div>
          <Label htmlFor="np-name">Name</Label>
          <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Web Foundations" />
        </div>
        <div>
          <Label htmlFor="np-slug">Slug</Label>
          <Input
            id="np-slug"
            value={effSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="web-foundations"
            className="font-mono"
          />
          <FormHint>Auto-suggested from the name. Lowercase letters, numbers, hyphens.</FormHint>
        </div>
        <div className="w-32">
          <Label htmlFor="np-level">Level number</Label>
          <Input id="np-level" type="number" min={1} value={levelNumber} onChange={(e) => setLevelNumber(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="np-desc">Description</Label>
          <Textarea id="np-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mut.isPending} disabled={name.trim().length < 2 || effSlug.length < 2} onClick={() => mut.mutate()}>
            Create path
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AddModuleModal({
  open,
  onClose,
  onCreated,
  path,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  path: AdminPath;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const effSlug = slugTouched ? slug : slugify(title);

  const mut = useMutation({
    mutationFn: () =>
      api('/admin/content/modules', {
        method: 'POST',
        body: { pathId: path.id, title, slug: effSlug, description },
      }),
    onSuccess: () => {
      toast('success', 'Module created');
      void qc.invalidateQueries({ queryKey: qk.adminPaths });
      void qc.invalidateQueries({ queryKey: ['admin', 'modules'] });
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      setDescription('');
      onCreated();
      onClose();
    },
    onError: (e) => toast('error', 'Could not create module', errMsg(e)),
  });

  return (
    <Modal open={open} onClose={onClose} title={`New module in ${path.name}`}>
      <div className="space-y-4 p-5">
        <div>
          <Label htmlFor="nm-title">Title</Label>
          <Input id="nm-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Networking Basics" />
        </div>
        <div>
          <Label htmlFor="nm-slug">Slug</Label>
          <Input
            id="nm-slug"
            value={effSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="networking-basics"
            className="font-mono"
          />
        </div>
        <div>
          <Label htmlFor="nm-desc">Description</Label>
          <Textarea id="nm-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mut.isPending} disabled={title.trim().length < 2 || effSlug.length < 2} onClick={() => mut.mutate()}>
            Create module
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------------------------- Lessons --------------------------------- */

function LessonsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQ(search), 350);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [q, status]);

  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (status !== 'all') params.set('status', status);
  params.set('page', String(page));
  params.set('pageSize', '20');
  const qs = params.toString();

  const lessonsQ = useQuery({
    queryKey: qk.adminLessons(qs),
    queryFn: () => api<{ lessons: AdminLessonRow[]; pagination: import('@suraksha/shared').Pagination }>(
      `/admin/content/lessons?${qs}`,
    ),
  });

  const pathsQ = useQuery({
    queryKey: qk.adminPaths,
    queryFn: () => api<{ paths: AdminPath[] }>('/admin/content/paths'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      api(`/admin/content/lessons/${id}/status`, { method: 'POST', body: { status: next } }),
    onSuccess: (_d, v) => {
      toast('success', v.next === 'published' ? 'Lesson published' : v.next === 'archived' ? 'Lesson archived' : 'Lesson unpublished');
      void qc.invalidateQueries({ queryKey: ['admin', 'lessons'] });
    },
    onError: (e) => toast('error', 'Status change rejected', errMsg(e)),
  });

  const rows = lessonsQ.data?.lessons ?? [];
  const pg = lessonsQ.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessonsâ€¦"
            className="pl-9"
            aria-label="Search lessons"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="w-36">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="size-4" aria-hidden />
          New lesson
        </Button>
      </div>

      {lessonsQ.isError ? (
        <ErrorState
          description={errMsg(lessonsQ.error)}
          action={
            <Button variant="outline" size="sm" onClick={() => void lessonsQ.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Module</TH>
                <TH>Status</TH>
                <TH className="text-right">Version</TH>
                <TH className="text-right">Views</TH>
                <TH className="text-right">Completions</TH>
                <TH>Updated</TH>
                <TH className="w-12" />
              </TR>
            </THead>
            <TBody>
              {lessonsQ.isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TR key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TD key={j}>
                        <Skeleton className="h-4 w-full max-w-24" />
                      </TD>
                    ))}
                  </TR>
                ))}
              {!lessonsQ.isLoading && rows.length === 0 && (
                <TR>
                  <TD colSpan={8} className="py-12 text-center text-text-tertiary">
                    No lessons match the current filters.
                  </TD>
                </TR>
              )}
              {rows.map((l) => (
                <TR key={l.id}>
                  <TD>
                    <p className="max-w-64 truncate font-medium">{l.title}</p>
                    <p className="max-w-64 truncate font-mono text-xs text-text-tertiary">{l.slug}</p>
                  </TD>
                  <TD className="text-sm text-text-secondary">
                    <p className="max-w-40 truncate">{l.moduleTitle}</p>
                    <p className="text-xs text-text-tertiary">{l.pathName}</p>
                  </TD>
                  <TD>
                    <StatusBadge status={l.status} />
                  </TD>
                  <TD className="text-right tabular-nums text-text-secondary">v{l.version}</TD>
                  <TD className="text-right tabular-nums text-text-secondary">{l.viewCount.toLocaleString()}</TD>
                  <TD className="text-right tabular-nums text-text-secondary">{l.completionCount.toLocaleString()}</TD>
                  <TD className="text-sm text-text-secondary">
                    <Tooltip label={formatDate(l.updatedAt)}>
                      <span>{timeAgo(l.updatedAt)}</span>
                    </Tooltip>
                  </TD>
                  <TD>
                    <Dropdown
                      trigger={
                        <span className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text">
                          <MoreVertical className="size-4" aria-hidden />
                        </span>
                      }
                    >
                      <DropdownItem icon={PencilLine} onClick={() => navigate(`/admin/content/lessons/${l.id}`)}>
                        Edit
                      </DropdownItem>
                      {l.status !== 'published' && (
                        <DropdownItem icon={ChevronRight} onClick={() => statusMut.mutate({ id: l.id, next: 'published' })}>
                          Publish
                        </DropdownItem>
                      )}
                      {l.status === 'published' && (
                        <DropdownItem icon={ChevronRight} onClick={() => statusMut.mutate({ id: l.id, next: 'draft' })}>
                          Unpublish
                        </DropdownItem>
                      )}
                      {l.status !== 'archived' && (
                        <DropdownItem danger icon={ChevronRight} onClick={() => statusMut.mutate({ id: l.id, next: 'archived' })}>
                          Archive
                        </DropdownItem>
                      )}
                    </Dropdown>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
            <span>{pg ? `${pg.total.toLocaleString()} lessons` : ''}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!pg || page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="tabular-nums">
                Page {pg?.page ?? page}
                {pg && pg.totalPages > 0 ? ` of ${pg.totalPages}` : ''}
              </span>
              <Button variant="outline" size="sm" disabled={!pg || page >= pg.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </TableCard>
      )}

      <NewLessonModal open={newOpen} onClose={() => setNewOpen(false)} paths={pathsQ.data?.paths ?? []} />
    </div>
  );
}

function NewLessonModal({
  open,
  onClose,
  paths,
}: {
  open: boolean;
  onClose: () => void;
  paths: AdminPath[];
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pathId, setPathId] = useState('');
  const activePath = paths.find((p) => p.id === pathId) ?? null;
  const modules = useModules(pathId || null, activePath?.modules);
  const [moduleId, setModuleId] = useState('');

  useEffect(() => {
    if (open) {
      setPathId(paths[0]?.id ?? '');
      setModuleId('');
    }
  }, [open]);

  useEffect(() => {
    setModuleId('');
  }, [pathId]);

  const [title, setTitle] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [minutes, setMinutes] = useState('10');
  const effSlug = slugTouched ? slug : slugify(title);

  const mut = useMutation({
    mutationFn: () =>
      api<{ lesson: { id: string } }>('/admin/content/lessons', {
        method: 'POST',
        body: {
          moduleId,
          title,
          slug: effSlug,
          summary,
          estimatedMinutes: Math.max(1, Math.trunc(Number(minutes)) || 10),
          blocks: [],
        },
      }),
    onSuccess: (res) => {
      toast('success', 'Lesson created', 'Opening the editorâ€¦');
      onClose();
      navigate(`/admin/content/lessons/${res.lesson.id}`);
    },
    onError: (e) => toast('error', 'Could not create lesson', errMsg(e)),
  });

  return (
    <Modal open={open} onClose={onClose} title="New lesson">
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="nl-path">Path</Label>
            <Select id="nl-path" value={pathId} onChange={(e) => setPathId(e.target.value)}>
              {paths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="nl-module">Module</Label>
            <Select id="nl-module" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
              <option value="">Select moduleâ€¦</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="nl-title">Title</Label>
          <Input id="nl-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Understanding XSS" />
        </div>
        <div>
          <Label htmlFor="nl-slug">Slug</Label>
          <Input
            id="nl-slug"
            value={effSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="understanding-xss"
            className="font-mono"
          />
        </div>
        <div>
          <Label htmlFor="nl-summary">Summary</Label>
          <Textarea id="nl-summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[72px]" />
        </div>
        <div className="w-40">
          <Label htmlFor="nl-minutes">Estimated minutes</Label>
          <Input id="nl-minutes" type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mut.isPending} disabled={!moduleId || title.trim().length < 2 || effSlug.length < 2} onClick={() => mut.mutate()}>
            Create lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
}
