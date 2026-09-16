import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { FormHint, Input, Label, Textarea } from '@/components/ui/input';
import { Badge, Card, CardContent, EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { Modal } from '@/components/ui/overlay';
import type { DiagramDetail, DiagramSummary } from '@suraksha/shared';

const MIME_BY_EXT: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

function errMsg(e: unknown) {
  return e instanceof ApiError ? e.message : 'Something went wrong.';
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function prettyBytes(n: number) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

/** Reads a picked file as SVG text or base64, whichever the type needs. */
function readFile(file: File): Promise<{ mimeType: string; content: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) return Promise.reject(new Error('Use an SVG, PNG, JPEG, WebP or GIF file.'));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    if (mimeType === 'image/svg+xml') {
      reader.onload = () => resolve({ mimeType, content: String(reader.result ?? '') });
      reader.readAsText(file);
    } else {
      reader.onload = () => {
        const result = String(reader.result ?? '');
        resolve({ mimeType, content: result.slice(result.indexOf(',') + 1) });
      };
      reader.readAsDataURL(file);
    }
  });
}

/* ------------------------------ Editor modal ------------------------------ */

function DiagramForm({
  existing,
  onClose,
}: {
  existing: DiagramSummary | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(existing);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const detailQ = useQuery({
    queryKey: qk.adminDiagram(existing?.slug ?? 'new'),
    queryFn: () => api<{ diagram: DiagramDetail }>(`/admin/diagrams/${existing!.slug}`),
    enabled: isEdit,
  });

  const [title, setTitle] = useState(existing?.title ?? '');
  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState(existing?.category ?? 'general');
  const [mimeType, setMimeType] = useState(existing?.mimeType ?? 'image/svg+xml');
  const [content, setContent] = useState('');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Hydrate the source once the detail query lands.
  const detail = detailQ.data?.diagram;
  if (detail && loadedFor !== detail.slug) {
    setLoadedFor(detail.slug);
    setContent(detail.content);
    setMimeType(detail.mimeType);
    setCategory(detail.category);
    setDescription(detail.description);
    setTitle(detail.title);
  }

  const isSvg = mimeType === 'image/svg+xml';

  const previewSrc = useMemo(() => {
    if (!content.trim()) return null;
    if (isSvg) {
      try {
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(content)))}`;
      } catch {
        return null;
      }
    }
    return `data:${mimeType};base64,${content}`;
  }, [content, isSvg, mimeType]);

  const saveMut = useMutation({
    mutationFn: () => {
      const body = { title, description, category, mimeType, content };
      return isEdit
        ? api<{ diagram: { slug: string } }>(`/admin/diagrams/${existing!.slug}`, { method: 'PATCH', body })
        : api<{ diagram: { slug: string } }>('/admin/diagrams', { method: 'POST', body: { ...body, slug } });
    },
    onSuccess: () => {
      toast('success', isEdit ? 'Diagram updated' : 'Diagram created');
      void qc.invalidateQueries({ queryKey: qk.adminDiagrams });
      if (isEdit) void qc.invalidateQueries({ queryKey: qk.adminDiagram(existing!.slug) });
      onClose();
    },
    onError: (e) => toast('error', 'Save failed', errMsg(e)),
  });

  async function onPick(file: File | undefined) {
    if (!file) return;
    try {
      const { mimeType: mt, content: body } = await readFile(file);
      setMimeType(mt);
      setContent(body);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
      if (!slugTouched && !isEdit) setSlug(slugify(file.name.replace(/\.[^.]+$/, '')));
      toast('success', 'File loaded', 'Review the preview, then save.');
    } catch (e) {
      toast('error', 'Could not load file', e instanceof Error ? e.message : undefined);
    }
  }

  const canSave = title.trim().length >= 2 && content.trim().length > 0 && (isEdit || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));

  return (
    <Modal open onClose={onClose} title={isEdit ? `Edit diagram: ${existing!.slug}` : 'New diagram'} size="xl">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="dg-title">Title</Label>
            <Input
              id="dg-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched && !isEdit) setSlug(slugify(e.target.value));
              }}
              placeholder="TCP three-way handshake"
            />
          </div>
          <div>
            <Label htmlFor="dg-slug">Slug</Label>
            {isEdit ? (
              <div className="flex h-10 items-center rounded-lg border border-border bg-surface-2 px-3 font-mono text-sm text-text-secondary">
                {existing!.slug}
              </div>
            ) : (
              <>
                <Input
                  id="dg-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="font-mono"
                  placeholder="tcp-handshake"
                />
                <FormHint>Used in the URL: /api/v1/diagrams/{slug || 'your-slug'}</FormHint>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="dg-category">Category</Label>
            <Input id="dg-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="networking" />
          </div>
          <div>
            <Label htmlFor="dg-desc">Description</Label>
            <Input id="dg-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note for editors" />
          </div>
        </div>

        <div>
          <Label>Image</Label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp,.gif"
              className="hidden"
              onChange={(e) => void onPick(e.target.files?.[0])}
            />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" aria-hidden />
              Upload a file
            </Button>
            <span className="text-xs text-text-tertiary">SVG, PNG, JPEG, WebP or GIF · max 512 KB</span>
          </div>
        </div>

        {previewSrc && (
          <div>
            <Label>Preview</Label>
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <img src={previewSrc} alt="Diagram preview" className="mx-auto max-h-72 w-full object-contain" />
            </div>
          </div>
        )}

        {isSvg ? (
          <div>
            <Label htmlFor="dg-src">SVG source</Label>
            <Textarea
              id="dg-src"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[220px] font-mono text-xs"
              placeholder="<svg xmlns=…>"
            />
            <FormHint>
              Edit the markup directly — the preview above updates as you type. Scripts and external references are stripped on save.
            </FormHint>
          </div>
        ) : (
          <FormHint>
            {content ? `${prettyBytes(Math.round((content.length * 3) / 4))} of ${mimeType} data loaded.` : 'Upload a file to replace this image.'}
          </FormHint>
        )}

        {detailQ.isLoading && <Skeleton className="h-4 w-40" />}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => saveMut.mutate()} disabled={!canSave || saveMut.isPending} loading={saveMut.isPending}>
            {isEdit ? 'Save changes' : 'Create diagram'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function AdminDiagramsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [formFor, setFormFor] = useState<DiagramSummary | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<DiagramSummary | null>(null);
  const [q, setQ] = useState('');

  const listQ = useQuery({
    queryKey: qk.adminDiagrams,
    queryFn: () => api<{ diagrams: DiagramSummary[] }>('/admin/diagrams'),
  });

  const deleteMut = useMutation({
    mutationFn: (slug: string) => api(`/admin/diagrams/${slug}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Diagram deleted');
      void qc.invalidateQueries({ queryKey: qk.adminDiagrams });
      setDeleteTarget(null);
    },
    onError: (e) => toast('error', 'Delete failed', errMsg(e)),
  });

  const grouped = useMemo(() => {
    const items = (listQ.data?.diagrams ?? []).filter(
      (d) => !q.trim() || d.title.toLowerCase().includes(q.toLowerCase()) || d.slug.includes(q.toLowerCase()),
    );
    const map = new Map<string, DiagramSummary[]>();
    for (const d of items) {
      const arr = map.get(d.category) ?? [];
      arr.push(d);
      map.set(d.category, arr);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [listQ.data, q]);

  const total = listQ.data?.diagrams.length ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Diagrams</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Images used by lessons. Stored in the database, so changes here go live immediately — no deploy.
          </p>
        </div>
        <Button onClick={() => setFormFor(null)}>
          <Plus className="size-4" aria-hidden />
          New diagram
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search diagrams…" className="max-w-xs" />
        <span className="text-xs text-text-tertiary">{total} total</span>
      </div>

      {listQ.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      )}

      {listQ.isError && (
        <ErrorState
          title="Could not load diagrams"
          description="The request failed."
          action={
            <Button variant="outline" onClick={() => listQ.refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {listQ.data && total === 0 && (
        <EmptyState
          icon={ImageIcon}
          title="No diagrams yet"
          description="Upload an SVG or PNG, or run the diagram generator script to seed the starter set."
        />
      )}

      {grouped.map(([category, items]) => (
        <section key={category} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d) => (
              <Card key={d.id}>
                <CardContent className="space-y-3">
                  <div className="overflow-hidden rounded-lg border border-border bg-surface-2 p-2">
                    <img src={d.url} alt={d.title} loading="lazy" className="h-32 w-full object-contain" />
                  </div>
                  <div>
                    <p className="truncate text-sm font-semibold text-text">{d.title}</p>
                    <p className="truncate font-mono text-[11px] text-text-tertiary">{d.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                    <Badge>{d.mimeType.replace('image/', '').replace('svg+xml', 'svg')}</Badge>
                    <span>{prettyBytes(d.sizeBytes)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setFormFor(d)}>
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => setDeleteTarget(d)} aria-label={`Delete ${d.title}`}>
                      <Trash2 className="size-3.5 text-danger" aria-hidden />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {formFor !== undefined && <DiagramForm existing={formFor} onClose={() => setFormFor(undefined)} />}

      {deleteTarget && (
        <Modal open onClose={() => setDeleteTarget(null)} title="Delete this diagram?">
          <p className="text-sm text-text-secondary">
            <span className="font-mono text-text">{deleteTarget.slug}</span> will stop loading in every lesson that embeds it. Lessons keep
            the image block, so they will show a broken image until you point them elsewhere.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteMut.mutate(deleteTarget.slug)} loading={deleteMut.isPending}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
