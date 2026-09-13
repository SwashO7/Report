import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlignLeft,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  FlaskConical,
  Heading2,
  Image as ImageIcon,
  Info,
  List,
  ListChecks,
  PencilLine,
  Plus,
  Rocket,
  Save,
  Terminal,
  Trash2,
  Undo2,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { cn, timeAgo } from '@/lib/utils';
import { StatusBadge } from '@/features/admin/status-badge';
import { ExerciseModal, type AdminExercise } from '@/features/admin/exercise-modal';
import type { ContentBlock } from '@suraksha/shared';
import { Button } from '@/components/ui/button';
import { FormHint, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Badge, Card, CardContent, EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { Dropdown, DropdownItem, Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';

interface AdminVersion {
  id: string;
  version: number;
  changeNote: string | null;
  changedByName: string | null;
  createdAt: string;
}

interface LessonEditorData {
  lesson: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    estimatedMinutes: number;
    blocks: ContentBlock[];
    status: string;
    version: number;
    moduleId: string;
  };
  module: { id: string; slug: string; title: string; pathSlug?: string; pathName?: string };
  exercises: AdminExercise[];
  versions: AdminVersion[];
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');
const linesOf = (s: string) => s.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim().length > 0);

const BLOCK_TYPES: { type: ContentBlock['type']; label: string; icon: LucideIcon }[] = [
  { type: 'heading', label: 'Heading', icon: Heading2 },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'code', label: 'Code', icon: Code2 },
  { type: 'command', label: 'Command', icon: Terminal },
  { type: 'callout', label: 'Callout', icon: Info },
  { type: 'list', label: 'List', icon: List },
  { type: 'quiz', label: 'Quiz', icon: ListChecks },
  { type: 'practice_ref', label: 'Practice reference', icon: ClipboardCheck },
  { type: 'lab_ref', label: 'Lab reference', icon: FlaskConical },
  { type: 'resource', label: 'Resource link', icon: ExternalLink },
  { type: 'related_lesson', label: 'Related lesson', icon: BookOpen },
  { type: 'related_lab', label: 'Related lab', icon: Flag },
];

const TYPE_META = Object.fromEntries(BLOCK_TYPES.map((t) => [t.type, t])) as Record<
  ContentBlock['type'],
  (typeof BLOCK_TYPES)[number]
>;

function newBlock(type: ContentBlock['type']): ContentBlock {
  switch (type) {
    case 'heading':
      return { type, level: 2, text: '' };
    case 'paragraph':
      return { type, text: '' };
    case 'video':
      return { type, provider: 'youtube', url: '', title: '' };
    case 'image':
      return { type, src: '', alt: '' };
    case 'code':
      return { type, language: 'bash', filename: '', code: '' };
    case 'command':
      return { type, description: '', commands: [''] };
    case 'callout':
      return { type, variant: 'info', title: '', text: '' };
    case 'list':
      return { type, ordered: false, items: [''] };
    case 'quiz':
      return { type, question: '', options: ['', ''], correctIndex: 0, explanation: '' };
    case 'practice_ref':
      return { type, title: '', exerciseSlug: '' };
    case 'lab_ref':
      return { type, labSlug: '', title: '' };
    case 'resource':
      return { type, label: '', url: '', kind: 'external', description: '' };
    case 'related_lesson':
      return { type, lessonSlug: '', title: '' };
    case 'related_lab':
      return { type, labSlug: '', title: '' };
  }
}

function cleanBlock(b: ContentBlock): ContentBlock {
  switch (b.type) {
    case 'command':
      return { ...b, commands: linesOf(b.commands.join('\n')) };
    case 'list':
      return { ...b, items: linesOf(b.items.join('\n')) };
    case 'quiz':
      return { ...b, options: linesOf(b.options.join('\n')) };
    default:
      return b;
  }
}

function blockFilled(b: ContentBlock): boolean {
  switch (b.type) {
    case 'heading':
    case 'paragraph':
    case 'callout':
      return b.text.trim().length > 0;
    case 'video':
      return b.url.trim().length > 0;
    case 'image':
      return b.src.trim().length > 0 && b.alt.trim().length > 0;
    case 'code':
      return b.code.trim().length > 0;
    case 'command':
      return b.commands.some((c) => c.trim().length > 0);
    case 'list':
      return b.items.some((i) => i.trim().length > 0);
    case 'quiz':
      return b.question.trim().length > 0 && b.options.filter((o) => o.trim()).length >= 2;
    case 'practice_ref':
    case 'lab_ref':
    case 'resource':
    case 'related_lesson':
    case 'related_lab':
      return true;
    default:
      return true;
  }
}

function blockSnippet(b: ContentBlock): string {
  switch (b.type) {
    case 'heading':
    case 'paragraph':
    case 'callout':
      return b.text.slice(0, 80);
    case 'video':
      return b.title || b.url;
    case 'image':
      return b.alt || b.src;
    case 'code':
      return b.filename || b.code.split('\n')[0] || '';
    case 'command':
      return b.description || b.commands[0] || '';
    case 'list':
      return `${b.items.length} item${b.items.length === 1 ? '' : 's'}`;
    case 'quiz':
      return b.question;
    case 'practice_ref':
      return b.title || b.exerciseSlug;
    case 'lab_ref':
    case 'related_lab':
      return b.title || b.labSlug;
    case 'related_lesson':
      return b.title || b.lessonSlug;
    case 'resource':
      return b.label || b.url;
    default:
      return '';
  }
}

export default function LessonEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const lessonQ = useQuery({
    queryKey: qk.adminLesson(id ?? 'none'),
    queryFn: () => api<LessonEditorData>(`/admin/content/lessons/${id}`),
    enabled: !!id,
  });

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [minutes, setMinutes] = useState('10');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const loadedKey = useRef<string | null>(null);
  const baseline = useRef('');

  useEffect(() => {
    const l = lessonQ.data?.lesson;
    if (!l) return;
    const key = `${l.id}:${l.version}`;
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setTitle(l.title);
    setSummary(l.summary);
    setMinutes(String(l.estimatedMinutes));
    setBlocks(l.blocks);
    baseline.current = JSON.stringify({ t: l.title, s: l.summary, m: String(l.estimatedMinutes), b: l.blocks });
  }, [lessonQ.data]);

  const serialized = JSON.stringify({ t: title, s: summary, m: minutes, b: blocks });
  const dirty = loadedKey.current !== null && serialized !== baseline.current;

  const [saveOpen, setSaveOpen] = useState(false);
  const [changeNote, setChangeNote] = useState('');
  const [statusTarget, setStatusTarget] = useState<string | null>(null);
  const [exFormOpen, setExFormOpen] = useState(false);
  const [exInitial, setExInitial] = useState<AdminExercise | null>(null);
  const [exDeleteTarget, setExDeleteTarget] = useState<AdminExercise | null>(null);
  const [viewVersion, setViewVersion] = useState<number | null>(null);

  const saveMut = useMutation({
    mutationFn: (note: string) =>
      api<{ lesson: { version: number } }>(`/admin/content/lessons/${id}`, {
        method: 'PATCH',
        body: {
          title,
          summary,
          estimatedMinutes: Math.max(1, Math.trunc(Number(minutes)) || 10),
          blocks: blocks.map(cleanBlock).filter(blockFilled),
          changeNote: note.trim() || 'Content updated',
        },
      }),
    onSuccess: (res) => {
      toast('success', `Saved as version v${res.lesson.version}`);
      baseline.current = serialized;
      setSaveOpen(false);
      setChangeNote('');
      void qc.invalidateQueries({ queryKey: qk.adminLesson(id ?? 'none') });
    },
    onError: (e) => toast('error', 'Save failed', errMsg(e)),
  });

  const statusMut = useMutation({
    mutationFn: (status: string) =>
      api(`/admin/content/lessons/${id}/status`, { method: 'POST', body: { status } }),
    onSuccess: (_d, status) => {
      toast('success', status === 'published' ? 'Lesson published' : status === 'archived' ? 'Lesson archived' : 'Lesson unpublished');
      setStatusTarget(null);
      void qc.invalidateQueries({ queryKey: qk.adminLesson(id ?? 'none') });
      void qc.invalidateQueries({ queryKey: ['admin', 'lessons'] });
    },
    onError: (e) => {
      setStatusTarget(null);
      toast('error', 'Status change rejected', errMsg(e));
    },
  });

  const exDeleteMut = useMutation({
    mutationFn: (exId: string) => api(`/admin/content/exercises/${exId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Exercise deleted');
      setExDeleteTarget(null);
      void qc.invalidateQueries({ queryKey: qk.adminLesson(id ?? 'none') });
    },
    onError: (e) => toast('error', 'Delete failed', errMsg(e)),
  });

  const versionQ = useQuery({
    queryKey: ['admin', 'lesson-version', id, viewVersion],
    queryFn: () =>
      api<{ lesson: { blocks: ContentBlock[]; title?: string; summary?: string; estimatedMinutes?: number } }>(
        `/admin/content/lessons/${id}/versions/${viewVersion}`,
      ),
    enabled: !!id && viewVersion !== null,
  });

  const sortedVersions = useMemo(
    () => [...(lessonQ.data?.versions ?? [])].sort((a, b) => b.version - a.version),
    [lessonQ.data],
  );

  const lesson = lessonQ.data?.lesson;
  const moduleInfo = lessonQ.data?.module;

  const updateBlock = (index: number, next: ContentBlock) =>
    setBlocks((bs) => bs.map((b, i) => (i === index ? next : b)));

  const moveBlock = (index: number, dir: -1 | 1) =>
    setBlocks((bs) => {
      const j = index + dir;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });

  const restoreVersion = () => {
    const l = versionQ.data?.lesson;
    if (!l || !Array.isArray(l.blocks)) return;
    setBlocks(l.blocks);
    if (l.title) setTitle(l.title);
    if (typeof l.summary === 'string') setSummary(l.summary);
    if (typeof l.estimatedMinutes === 'number') setMinutes(String(l.estimatedMinutes));
    setViewVersion(null);
    toast('info', 'Version restored into the editor', 'Review the content, then save to persist it as a new version.');
  };

  if (lessonQ.isError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState description={errMsg(lessonQ.error)} action={<Button variant="outline" size="sm" onClick={() => void lessonQ.refetch()}>Try again</Button>} />
      </div>
    );
  }

  if (lessonQ.isLoading || !lesson) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  const previewHref = `/learn/${moduleInfo?.pathSlug ?? 'foundations'}/${lesson.slug}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/content"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Learning content
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <a href={previewHref} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Eye className="size-4" aria-hidden />
              Preview
            </Button>
          </a>
          {lesson.status !== 'published' ? (
            <Button size="sm" onClick={() => setStatusTarget('published')}>
              <Rocket className="size-4" aria-hidden />
              Publish
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setStatusTarget('draft')}>
                Unpublish
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatusTarget('archived')}>
                Archive
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Lesson title"
          className="border-transparent bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus:ring-0"
          placeholder="Lesson title"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={lesson.status} />
          <Badge variant="outline">v{lesson.version}</Badge>
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1.5 text-xs font-medium',
              saveMut.isPending ? 'text-text-tertiary' : dirty ? 'text-warning' : 'text-success',
            )}
          >
            <span className={cn('size-1.5 rounded-full', saveMut.isPending ? 'bg-text-tertiary' : dirty ? 'bg-warning' : 'bg-success')} />
            {saveMut.isPending ? 'Savingâ€¦' : dirty ? 'Unsaved changes' : 'Saved'}
          </span>
          <Button size="sm" disabled={!dirty} loading={saveMut.isPending} onClick={() => setSaveOpen(true)}>
            <Save className="size-4" aria-hidden />
            Save draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="le-summary">Summary</Label>
                <Textarea id="le-summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[72px]" />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-36">
                  <Label htmlFor="le-minutes">Est. minutes</Label>
                  <Input id="le-minutes" type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
                </div>
                <div className="flex-1">
                  <Label>Slug</Label>
                  <div className="flex h-10 items-center rounded-lg border border-border bg-surface-2 px-3 font-mono text-sm text-text-secondary">
                    {lesson.slug}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h3 className="font-semibold tracking-tight">Content blocks</h3>
                <p className="mt-0.5 text-sm text-text-secondary">{blocks.length} block{blocks.length === 1 ? '' : 's'} Â· empty blocks are dropped on save</p>
              </div>
              <Dropdown
                trigger={
                  <Button variant="secondary" size="sm">
                    <Plus className="size-4" aria-hidden />
                    Add block
                    <ChevronDown className="size-3.5" aria-hidden />
                  </Button>
                }
              >
                <div className="grid w-[22rem] grid-cols-2 gap-0.5">
                  {BLOCK_TYPES.map((t) => (
                    <DropdownItem
                      key={t.type}
                      icon={t.icon}
                      onClick={() => setBlocks((bs) => [...bs, newBlock(t.type)])}
                    >
                      {t.label}
                    </DropdownItem>
                  ))}
                </div>
              </Dropdown>
            </div>
            <CardContent className="space-y-3">
              {blocks.length === 0 && (
                <EmptyState
                  icon={Plus}
                  title="No content blocks yet"
                  description="Use the Add block menu to build the lesson â€” headings, paragraphs, code, quizzes and more."
                />
              )}
              {blocks.map((b, i) => (
                <BlockCard
                  key={`${i}-${b.type}`}
                  index={i}
                  total={blocks.length}
                  block={b}
                  exercises={lessonQ.data?.exercises ?? []}
                  onChange={(next) => updateBlock(i, next)}
                  onMove={(dir) => moveBlock(i, dir)}
                  onDuplicate={() =>
                    setBlocks((bs) => [...bs.slice(0, i + 1), JSON.parse(JSON.stringify(bs[i])) as ContentBlock, ...bs.slice(i + 1)])
                  }
                  onDelete={() => setBlocks((bs) => bs.filter((_, j) => j !== i))}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h3 className="font-semibold tracking-tight">Exercises</h3>
                <p className="mt-0.5 text-sm text-text-secondary">Practice attached to this lesson</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setExInitial(null);
                  setExFormOpen(true);
                }}
              >
                <Plus className="size-4" aria-hidden />
                New exercise
              </Button>
            </div>
            <CardContent className="divide-y divide-border p-0">
              {(lessonQ.data?.exercises.length ?? 0) === 0 && (
                <p className="px-5 py-8 text-center text-sm text-text-tertiary">No exercises yet.</p>
              )}
              {(lessonQ.data?.exercises ?? []).map((ex) => (
                <div key={ex.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ex.title}</p>
                    <p className="truncate font-mono text-xs text-text-tertiary">{ex.slug}</p>
                  </div>
                  <Badge variant="outline">{ex.questions.length} Q</Badge>
                  <Badge variant="accent">+{ex.xpReward} XP</Badge>
                  <StatusBadge status={ex.status} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExInitial(ex);
                      setExFormOpen(true);
                    }}
                  >
                    <PencilLine className="size-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-subtle" onClick={() => setExDeleteTarget(ex)}>
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
            <Undo2 className="size-4 text-text-tertiary" aria-hidden />
            <h3 className="font-semibold tracking-tight">Version history</h3>
          </div>
          <CardContent className="p-0">
            {sortedVersions.length === 0 && <p className="px-5 py-8 text-center text-sm text-text-tertiary">No versions recorded.</p>}
            <ul className="divide-y divide-border">
              {sortedVersions.map((v) => (
                <li key={v.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-accent">v{v.version}</span>
                    <Button variant="outline" size="sm" onClick={() => setViewVersion(v.version)}>
                      View
                    </Button>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-text">{v.changeNote || 'No change note'}</p>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {v.changedByName ?? 'Unknown'} Â· {timeAgo(v.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title="Save changes" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">Saving creates a new version of this lesson.</p>
          <div>
            <Label htmlFor="le-note">Change note</Label>
            <Input
              id="le-note"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Content updated"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button loading={saveMut.isPending} onClick={() => saveMut.mutate(changeNote)}>
              Save draft
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={statusTarget === 'published'} onClose={() => setStatusTarget(null)} title="Publish lesson" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            This makes the lesson visible to all learners. Learners will see it in{' '}
            <span className="font-medium text-text">{moduleInfo?.pathName ?? 'its path'}</span>.
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

      <Modal open={!!exDeleteTarget} onClose={() => setExDeleteTarget(null)} title="Delete exercise" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            Delete <span className="font-medium text-text">{exDeleteTarget?.title}</span>? Learner completion history for this exercise is
            preserved, but it disappears from lessons.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setExDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={exDeleteMut.isPending} onClick={() => exDeleteTarget && exDeleteMut.mutate(exDeleteTarget.id)}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <ExerciseModal
        open={exFormOpen}
        initial={exInitial}
        lessonId={lesson.id}
        onClose={() => setExFormOpen(false)}
      />

      <Modal open={viewVersion !== null} onClose={() => setViewVersion(null)} title={viewVersion !== null ? `Version v${viewVersion}` : ''} size="lg">
        <div className="p-5">
          {versionQ.isLoading && <Skeleton className="h-64 w-full rounded-lg" />}
          {versionQ.isError && <p className="text-sm text-danger">{errMsg(versionQ.error)}</p>}
          {versionQ.data && Array.isArray(versionQ.data.lesson?.blocks) && (
            <>
              <VersionBlocks blocks={versionQ.data.lesson.blocks} />
              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="ghost" onClick={() => setViewVersion(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    restoreVersion();
                  }}
                >
                  <Undo2 className="size-4" aria-hidden />
                  Restore this version
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/content"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Learning content
    </Link>
  );
}

function BlockCard({
  index,
  total,
  block,
  exercises,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
}: {
  index: number;
  total: number;
  block: ContentBlock;
  exercises: AdminExercise[];
  onChange: (next: ContentBlock) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const meta = TYPE_META[block.type];

  return (
    <div className="group/blk rounded-lg border border-border bg-surface transition-colors focus-within:border-border-strong hover:border-border-strong">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand block' : 'Collapse block'}
          className="rounded p-1 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
        >
          {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
        <span className="font-mono text-xs tabular-nums text-text-tertiary">{String(index + 1).padStart(2, '0')}</span>
        <Badge variant="accent" className="shrink-0">
          {meta.label}
        </Badge>
        {!collapsed && <p className="hidden min-w-0 flex-1 truncate text-sm text-text-tertiary sm:block">{blockSnippet(block)}</p>}
        <div className={cn('ml-auto flex items-center gap-0.5 transition-opacity', confirming ? 'opacity-100' : 'opacity-0 group-hover/blk:opacity-100 focus-within:opacity-100')}>
          {!confirming ? (
            <>
              <IconBtn label="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
                <ChevronUp className="size-4" />
              </IconBtn>
              <IconBtn label="Move down" disabled={index === total - 1} onClick={() => onMove(1)}>
                <ChevronDown className="size-4" />
              </IconBtn>
              <IconBtn label="Duplicate" onClick={onDuplicate}>
                <Copy className="size-4" />
              </IconBtn>
              <IconBtn label="Delete" danger onClick={() => setConfirming(true)}>
                <Trash2 className="size-4" />
              </IconBtn>
            </>
          ) : (
            <>
              <span className="mr-1 text-xs font-medium text-danger">Delete?</span>
              <Button variant="danger" size="sm" onClick={onDelete}>
                Yes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                No
              </Button>
            </>
          )}
        </div>
      </div>
      {!collapsed && (
        <div className="space-y-3 border-t border-border p-4">
          <BlockFields block={block} exercises={exercises} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function IconBtn({
  label,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-40',
        danger && 'hover:bg-danger-subtle hover:text-danger',
      )}
    >
      {children}
    </button>
  );
}

function BlockFields({
  block,
  exercises,
  onChange,
}: {
  block: ContentBlock;
  exercises: AdminExercise[];
  onChange: (next: ContentBlock) => void;
}) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="flex gap-3">
          <div className="w-24 shrink-0">
            <Label>Level</Label>
            <Select
              value={block.level}
              onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 | 4 })}
            >
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </Select>
          </div>
          <div className="min-w-0 flex-1">
            <Label>Text</Label>
            <Input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Section heading" />
          </div>
        </div>
      );
    case 'paragraph':
      return (
        <div>
          <Label>Paragraph text</Label>
          <Textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            className="min-h-[120px]"
            placeholder="Supports **bold**, *italic*, `inline code` and [links](https://â€¦)"
          />
        </div>
      );
    case 'video':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Provider</Label>
            <Select value={block.provider} onChange={(e) => onChange({ ...block, provider: e.target.value as 'youtube' | 'direct' })}>
              <option value="youtube">YouTube</option>
              <option value="direct">Direct URL</option>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Optional" />
          </div>
          <div className="sm:col-span-2">
            <Label>URL</Label>
            <Input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://â€¦" className="font-mono" />
          </div>
          <div className="w-40">
            <Label>Start at (seconds)</Label>
            <Input
              type="number"
              min={0}
              value={block.startAt ?? ''}
              onChange={(e) =>
                onChange({ ...block, startAt: e.target.value === '' ? undefined : Math.max(0, Math.trunc(Number(e.target.value))) })
              }
            />
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Image URL</Label>
            <Input value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })} placeholder="/uploads/â€¦ or https://â€¦" className="font-mono" />
          </div>
          <div>
            <Label>Alt text</Label>
            <Input value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
          </div>
          <div>
            <Label>Caption</Label>
            <Input value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Optional" />
          </div>
        </div>
      );
    case 'code':
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Language</Label>
              <Input value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value })} placeholder="bash" />
            </div>
            <div>
              <Label>Filename</Label>
              <Input value={block.filename ?? ''} onChange={(e) => onChange({ ...block, filename: e.target.value })} placeholder="exploit.py" />
            </div>
          </div>
          <div>
            <Label>Code</Label>
            <Textarea
              value={block.code}
              onChange={(e) => onChange({ ...block, code: e.target.value })}
              className="min-h-[160px] font-mono text-xs"
              spellCheck={false}
            />
          </div>
        </div>
      );
    case 'command':
      return (
        <div className="space-y-3">
          <div>
            <Label>Description</Label>
            <Input
              value={block.description ?? ''}
              onChange={(e) => onChange({ ...block, description: e.target.value })}
              placeholder="What do these commands do?"
            />
          </div>
          <div>
            <Label>Commands (one per line)</Label>
            <Textarea
              value={block.commands.join('\n')}
              onChange={(e) => onChange({ ...block, commands: e.target.value.split('\n') })}
              className="min-h-[96px] font-mono text-xs"
              spellCheck={false}
            />
          </div>
        </div>
      );
    case 'callout':
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
            <div>
              <Label>Variant</Label>
              <Select
                value={block.variant}
                onChange={(e) => onChange({ ...block, variant: e.target.value as 'info' | 'warning' | 'success' | 'danger' })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="danger">Danger</option>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          <div>
            <Label>Text</Label>
            <Textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} className="min-h-[80px]" />
          </div>
        </div>
      );
    case 'list':
      return (
        <div className="space-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={block.ordered}
              onChange={(e) => onChange({ ...block, ordered: e.target.checked })}
              className="size-4 rounded border-border-strong accent-[var(--accent)]"
            />
            Ordered list (1. 2. 3.)
          </label>
          <div>
            <Label>Items (one per line)</Label>
            <Textarea
              value={block.items.join('\n')}
              onChange={(e) => onChange({ ...block, items: e.target.value.split('\n') })}
              className="min-h-[110px]"
            />
          </div>
        </div>
      );
    case 'quiz': {
      const opts = block.options;
      return (
        <div className="space-y-3">
          <div>
            <Label>Question</Label>
            <Input value={block.question} onChange={(e) => onChange({ ...block, question: e.target.value })} />
          </div>
          <div>
            <Label>Options (one per line)</Label>
            <Textarea
              value={opts.join('\n')}
              onChange={(e) => {
                const next = e.target.value.split('\n');
                onChange({ ...block, options: next, correctIndex: Math.min(block.correctIndex, Math.max(0, next.length - 1)) });
              }}
              className="min-h-[100px]"
              placeholder={'Option A\nOption B'}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
            <div>
              <Label>Correct option</Label>
              <Select value={block.correctIndex} onChange={(e) => onChange({ ...block, correctIndex: Number(e.target.value) })}>
                {opts.map((o, i) => (
                  <option key={i} value={i}>
                    Option {i + 1}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Explanation</Label>
              <Input value={block.explanation ?? ''} onChange={(e) => onChange({ ...block, explanation: e.target.value })} placeholder="Shown after answering" />
            </div>
          </div>
        </div>
      );
    }
    case 'practice_ref':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Exercise</Label>
            <Select value={block.exerciseSlug} onChange={(e) => onChange({ ...block, exerciseSlug: e.target.value })}>
              <option value="">Select exerciseâ€¦</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.slug}>
                  {ex.title} ({ex.slug})
                </option>
              ))}
            </Select>
            {exercises.length === 0 && <FormHint>No exercises exist yet â€” create one below.</FormHint>}
          </div>
          <div>
            <Label>Display title</Label>
            <Input value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Test your knowledge" />
          </div>
        </div>
      );
    case 'lab_ref':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Lab slug</Label>
            <Input value={block.labSlug} onChange={(e) => onChange({ ...block, labSlug: e.target.value })} className="font-mono" placeholder="sql-injection-basics" />
          </div>
          <div>
            <Label>Title override</Label>
            <Input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Optional" />
          </div>
        </div>
      );
    case 'resource':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Label</Label>
            <Input value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder="Cheat sheet PDF" />
          </div>
          <div>
            <Label>Kind</Label>
            <Select value={block.kind} onChange={(e) => onChange({ ...block, kind: e.target.value as 'download' | 'external' })}>
              <option value="download">Download</option>
              <option value="external">External link</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>URL</Label>
            <Input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} className="font-mono" />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input value={block.description ?? ''} onChange={(e) => onChange({ ...block, description: e.target.value })} placeholder="Optional" />
          </div>
        </div>
      );
    case 'related_lesson':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Lesson slug</Label>
            <Input value={block.lessonSlug} onChange={(e) => onChange({ ...block, lessonSlug: e.target.value })} className="font-mono" />
          </div>
          <div>
            <Label>Title override</Label>
            <Input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Optional" />
          </div>
        </div>
      );
    case 'related_lab':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Lab slug</Label>
            <Input value={block.labSlug} onChange={(e) => onChange({ ...block, labSlug: e.target.value })} className="font-mono" />
          </div>
          <div>
            <Label>Title override</Label>
            <Input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Optional" />
          </div>
        </div>
      );
  }
}


function VersionBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            if (b.level === 2) return <h3 key={i} className="text-lg font-semibold tracking-tight">{b.text}</h3>;
            if (b.level === 3) return <h4 key={i} className="text-base font-semibold tracking-tight">{b.text}</h4>;
            return <h5 key={i} className="text-sm font-semibold tracking-tight">{b.text}</h5>;
          case 'paragraph':
            return (
              <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {b.text}
              </p>
            );
          case 'code':
            return (
              <pre key={i} className="overflow-x-auto rounded-lg bg-surface-3 p-3 font-mono text-xs">
                <code>{b.code}</code>
              </pre>
            );
          case 'command':
            return (
              <div key={i}>
                {b.description && <p className="mb-1.5 text-sm text-text-secondary">{b.description}</p>}
                <pre className="overflow-x-auto rounded-lg bg-surface-3 p-3 font-mono text-xs">
                  <code>{b.commands.join('\n')}</code>
                </pre>
              </div>
            );
          case 'callout':
            return (
              <div key={i} className="rounded-lg border border-border-strong bg-surface-2 p-3.5">
                {b.title && <p className="text-sm font-semibold">{b.title}</p>}
                <p className="mt-0.5 text-sm text-text-secondary">{b.text}</p>
              </div>
            );
          case 'list':
            return b.ordered ? (
              <ol key={i} className="list-decimal space-y-1 pl-5 text-sm text-text-secondary">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case 'quiz':
            return (
              <div key={i} className="rounded-lg border border-border p-3.5">
                <p className="text-sm font-medium">{b.question}</p>
                <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                  {b.options.map((o, oi) => (
                    <li key={oi} className={cn(oi === b.correctIndex && 'font-medium text-success')}>
                      {oi === b.correctIndex ? 'âœ“' : 'Â·'} {o}
                    </li>
                  ))}
                </ul>
                {b.explanation && <p className="mt-2 text-xs text-text-tertiary">{b.explanation}</p>}
              </div>
            );
          default:
            return (
              <pre key={i} className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-text-tertiary">
                {JSON.stringify(b, null, 2)}
              </pre>
            );
        }
      })}
    </div>
  );
}
