import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ExternalLink, Film, ImagePlus, RotateCcw, Save, Trash2, UploadCloud, X } from 'lucide-react';
import {
  REPORT_IMAGE_MAX_BYTES,
  REPORT_IMAGE_MIME_TYPES,
  REPORT_VIDEO_MAX_BYTES,
  REPORT_VIDEO_MIME_TYPES,
  type AdminReportDetail,
  type ReportMedia,
} from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { slugify } from '@/features/admin/slugify';
import { StatusBadge } from '@/features/admin/status-badge';
import { ReportImage, ReportVideo } from '@/features/reports/report-media';
import { DeleteReportModal } from '@/features/reports/delete-report-modal';
import { Button } from '@/components/ui/button';
import { FieldError, FormHint, Input, Label, Textarea } from '@/components/ui/input';
import { ErrorState, Skeleton } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

type Kind = 'image' | 'video';
type Status = 'draft' | 'published';

interface FormState {
  title: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  imageAlt: string;
  status: Status;
}

const freshForm = (): FormState => ({ title: '', slug: '', slugTouched: false, description: '', imageAlt: '', status: 'draft' });

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DESCRIPTION_MAX = 50_000;
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

const MEDIA_RULES: Record<Kind, { max: number; mimes: readonly string[]; exts: string[]; accept: string; label: string; types: string }> = {
  image: {
    max: REPORT_IMAGE_MAX_BYTES,
    mimes: REPORT_IMAGE_MIME_TYPES,
    exts: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    label: 'Image',
    types: 'JPEG, PNG, WebP or GIF',
  },
  video: {
    max: REPORT_VIDEO_MAX_BYTES,
    mimes: REPORT_VIDEO_MIME_TYPES,
    exts: ['mp4', 'webm'],
    accept: 'video/mp4,video/webm',
    label: 'Video',
    types: 'MP4 or WebM',
  },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Fast client-side check for immediate feedback. The server re-validates from the file bytes. */
function checkFile(file: File, kind: Kind): string | null {
  const rule = MEDIA_RULES[kind];
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const typeOk = file.type ? rule.mimes.includes(file.type) : rule.exts.includes(ext);
  if (!typeOk) {
    const other = kind === 'image' ? MEDIA_RULES.video : MEDIA_RULES.image;
    if (other.mimes.includes(file.type) || other.exts.includes(ext)) {
      return kind === 'image' ? 'That is a video. Use the video field instead.' : 'That is an image. Use the image field instead.';
    }
    return `Unsupported file type. Upload a ${rule.types} file.`;
  }
  if (file.size === 0) return 'That file is empty.';
  if (file.size > rule.max) return `${rule.label} is too large (${formatSize(file.size)}). The limit is ${formatSize(rule.max)}.`;
  return null;
}

/** Multipart submit with upload progress. Rejects with ApiError carrying the server's envelope. */
function sendReport(method: 'POST' | 'PATCH', url: string, body: FormData, onProgress: (pct: number) => void) {
  return new Promise<{ report: AdminReportDetail }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `/api/v1${url}`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: { report?: AdminReportDetail; error?: { code?: string; message?: string; details?: unknown } } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON (e.g. a proxy error page) */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.report) return resolve({ report: data.report });
      if (xhr.status === 413) return reject(new ApiError(413, 'TOO_LARGE', 'The upload is larger than the server accepts.'));
      reject(
        new ApiError(
          xhr.status,
          data?.error?.code ?? 'UNKNOWN',
          data?.error?.message ?? `Save failed (HTTP ${xhr.status}). Please try again.`,
          data?.error?.details,
        ),
      );
    };
    xhr.onerror = () => reject(new ApiError(0, 'NETWORK', 'Network error during upload. Check your connection and try again.'));
    xhr.send(body);
  });
}

/* ------------------------------ Section shell ------------------------------ */
// Same numbered-section chrome as the lab editor.

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface">
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

/* ------------------------------- Media field ------------------------------- */

function MediaField({
  kind,
  current,
  file,
  removed,
  error,
  onPick,
  onRemoveChange,
}: {
  kind: Kind;
  current: (ReportMedia & { alt?: string }) | null;
  file: File | null;
  removed: boolean;
  error?: string;
  onPick: (file: File | null) => void;
  onRemoveChange: (removed: boolean) => void;
}) {
  const rule = MEDIA_RULES[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);
  const Icon = kind === 'image' ? ImagePlus : Film;
  const browse = () => inputRef.current?.click();

  const preview = (media: ReportMedia) =>
    kind === 'image' ? (
      <ReportImage image={{ ...media, alt: 'Selected image preview' }} fit="natural" className="max-h-72" />
    ) : (
      <ReportVideo video={media} title="Selected video preview" />
    );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={rule.accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Choose ${kind} file`}
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
      <Label>
        {rule.label} <span className="font-normal text-text-tertiary">(optional)</span>
      </Label>

      {file && previewUrl ? (
        <div className="overflow-hidden rounded-lg border border-accent/50 bg-surface-2">
          {preview({ url: previewUrl, mimeType: file.type, sizeBytes: file.size })}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2.5">
            <p className="min-w-0 truncate text-xs text-text-secondary">
              <span className="font-medium text-text">{file.name}</span> · {formatSize(file.size)} ·{' '}
              {current ? 'replaces the current file on save' : 'uploads on save'}
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => onPick(null)}>
              <X className="size-3.5" aria-hidden /> Clear
            </Button>
          </div>
        </div>
      ) : current && !removed ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface-2">
          {preview(current)}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2.5">
            <p className="text-xs text-text-tertiary">
              Current {kind} · {formatSize(current.sizeBytes)}
            </p>
            <div className="flex gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={browse}>
                <UploadCloud className="size-3.5" aria-hidden /> Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveChange(true)}>
                <Trash2 className="size-3.5 text-danger" aria-hidden /> Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {removed && current && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-md border border-warning/30 bg-warning-subtle px-3 py-2 text-xs text-warning">
              The current {kind} will be removed when you save.
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveChange(false)}>
                <RotateCcw className="size-3.5" aria-hidden /> Undo
              </Button>
            </div>
          )}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Choose or drop a ${kind} file`}
            onClick={browse}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), browse())}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onPick(e.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              'cursor-pointer rounded-lg border border-dashed px-4 py-7 text-center transition-colors',
              dragOver ? 'border-accent bg-accent-subtle' : 'border-border-strong bg-surface-2 hover:border-accent/60',
              error && 'border-danger/60',
            )}
          >
            <Icon className="mx-auto size-6 text-text-tertiary" aria-hidden />
            <p className="mt-2 text-sm font-medium text-text">Drop {kind === 'image' ? 'an image' : 'a video'} here, or click to browse</p>
            <p className="mt-1 text-xs text-text-tertiary">
              {rule.types} · max {formatSize(rule.max)}
            </p>
          </div>
        </>
      )}
      <FieldError message={error} />
    </div>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function ReportEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const reportQ = useQuery({
    queryKey: qk.adminReport(id ?? 'new'),
    queryFn: () => api<{ report: AdminReportDetail }>(`/admin/reports/${id}`),
    enabled: !isNew,
    retry: (count, err) => !(err instanceof ApiError && (err.status === 404 || err.status === 403)) && count < 1,
  });
  const report = reportQ.data?.report ?? null;

  const [form, setForm] = useState<FormState>(freshForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const loadedKey = useRef<string | null>(null);

  // Hydrate the form whenever a (new version of the) report arrives.
  useEffect(() => {
    if (!report) return;
    const key = `${report.id}:${report.updatedAt}`;
    if (loadedKey.current === key) return;
    loadedKey.current = key;
    setForm({
      title: report.title,
      slug: report.slug,
      slugTouched: true,
      description: report.description,
      imageAlt: report.image && report.image.alt !== report.title ? report.image.alt : '',
      status: report.status,
    });
    setImageFile(null);
    setVideoFile(null);
    setRemoveImage(false);
    setRemoveVideo(false);
  }, [report]);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const effSlug = form.slugTouched ? form.slug : slugify(form.title);

  const pick = (kind: Kind, file: File | null) => {
    const setFile = kind === 'image' ? setImageFile : setVideoFile;
    if (!file) {
      setFile(null);
      setErrors(({ [kind]: _drop, ...rest }) => rest);
      return;
    }
    const problem = checkFile(file, kind);
    if (problem) {
      setErrors((e) => ({ ...e, [kind]: problem }));
      toast('error', kind === 'image' ? 'Invalid image' : 'Invalid video', problem);
      return;
    }
    setErrors(({ [kind]: _drop, ...rest }) => rest);
    setFile(file);
    if (kind === 'image') setRemoveImage(false);
    else setRemoveVideo(false);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters.';
    if (!form.description.trim()) e.description = 'Add the report information.';
    if (form.description.length > DESCRIPTION_MAX) e.description = `Keep the report under ${DESCRIPTION_MAX.toLocaleString()} characters.`;
    if (effSlug && !SLUG_RE.test(effSlug)) e.slug = 'Use lowercase letters, numbers and hyphens only.';
    if (!isNew && !effSlug) e.slug = 'The URL slug cannot be empty.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description);
      fd.append('imageAlt', form.imageAlt.trim());
      fd.append('status', form.status);
      // New reports with an untouched slug let the server pick a free one.
      if (!isNew || form.slugTouched) fd.append('slug', effSlug);
      if (imageFile) fd.append('image', imageFile);
      if (videoFile) fd.append('video', videoFile);
      if (!isNew) {
        fd.append('removeImage', String(removeImage && !imageFile));
        fd.append('removeVideo', String(removeVideo && !videoFile));
      }
      setProgress(imageFile || videoFile ? 0 : null);
      return sendReport(isNew ? 'POST' : 'PATCH', isNew ? '/admin/reports' : `/admin/reports/${id}`, fd, setProgress);
    },
    onSuccess: ({ report: saved }) => {
      setProgress(null);
      toast('success', isNew ? 'Report created' : 'Report saved', saved.status === 'published' ? 'It is live on the Reports page.' : 'Saved as a draft.');
      qc.setQueryData(qk.adminReport(saved.id), { report: saved });
      void qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      void qc.invalidateQueries({ queryKey: ['reports'] });
      if (isNew) navigate(`/admin/reports/${saved.id}`, { replace: true });
    },
    onError: (e) => {
      setProgress(null);
      // Map server-side field errors (Zod `details`) back onto the form.
      if (e instanceof ApiError && e.code === 'VALIDATION_ERROR' && Array.isArray(e.details)) {
        const fieldErrors: Record<string, string> = {};
        for (const d of e.details as { path?: string; message?: string }[]) if (d?.path) fieldErrors[d.path] = d.message ?? 'Invalid value.';
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      } else if (e instanceof ApiError && e.status === 409) {
        setErrors((prev) => ({ ...prev, slug: e.message }));
      }
      toast('error', isNew ? 'Could not create the report' : 'Could not save the report', errMsg(e));
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => api(`/admin/reports/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Report deleted');
      void qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      void qc.invalidateQueries({ queryKey: ['reports'] });
      navigate('/admin/reports', { replace: true });
    },
    onError: (e) => {
      setConfirmDelete(false);
      toast('error', 'Delete failed', errMsg(e));
    },
  });

  const onSave = () => {
    if (!validate()) {
      toast('error', 'Fix the highlighted fields before saving.');
      return;
    }
    saveMut.mutate();
  };

  if (!isNew && reportQ.isError) {
    return (
      <div className="space-y-4">
        <BackToReports />
        <ErrorState
          title={reportQ.error instanceof ApiError && reportQ.error.status === 404 ? 'Report not found' : 'Could not load this report'}
          description={errMsg(reportQ.error)}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/reports')}>
              Back to reports
            </Button>
          }
        />
      </div>
    );
  }

  const showImageAlt = Boolean(imageFile || (report?.image && !removeImage));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <BackToReports />
        {report && (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <a href={`/reports/${report.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="size-3.5" aria-hidden />
                {report.status === 'published' ? 'View public page' : 'Preview'}
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} aria-label="Delete report">
              <Trash2 className="size-3.5 text-danger" aria-hidden /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface px-5 py-4">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{isNew ? 'New report' : form.title || 'Untitled report'}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {isNew ? 'Write the report, optionally attach an image and/or a video, then save it as a draft or publish it.' : `/reports/${report?.slug ?? ''}`}
        </p>
      </div>

      {!isNew && reportQ.isLoading ? (
        <div className="mt-5 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <Section step={1} title="Details" hint="Headline and public URL">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="rp-title">Report title</Label>
                <Input
                  id="rp-title"
                  value={form.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Session fixation in Example App login"
                  maxLength={200}
                  aria-invalid={Boolean(errors.title)}
                />
                <FieldError message={errors.title} />
              </div>
              <div>
                <Label htmlFor="rp-slug">URL slug</Label>
                <Input
                  id="rp-slug"
                  value={effSlug}
                  onChange={(e) => patch({ slugTouched: true, slug: slugify(e.target.value) })}
                  className="font-mono"
                  placeholder="session-fixation-in-example-app-login"
                  maxLength={160}
                  aria-invalid={Boolean(errors.slug)}
                />
                <FieldError message={errors.slug} />
                <FormHint>
                  Public address: /reports/{effSlug || 'generated-from-the-title'}
                  {!isNew && ' · Changing it breaks links that were already shared.'}
                </FormHint>
              </div>
            </div>
          </Section>

          <Section step={2} title="Report information" hint="The full write-up shown on the report page">
            <Label htmlFor="rp-description">Report information</Label>
            <Textarea
              id="rp-description"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="min-h-[280px] leading-relaxed"
              placeholder={'What is affected, what happens, how it was found, the impact, and the current status.\n\nLeave a blank line between paragraphs.'}
              aria-invalid={Boolean(errors.description)}
            />
            <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2">
              <FormHint>
                Blank line = new paragraph. Supports **bold**, *italic*, `code` and [links](https://example.com). The first
                ~280 characters become the preview on the Reports page.
              </FormHint>
              <span className={cn('mt-1.5 shrink-0 text-xs tabular-nums', form.description.length > DESCRIPTION_MAX ? 'text-danger' : 'text-text-tertiary')}>
                {form.description.length.toLocaleString()} / {DESCRIPTION_MAX.toLocaleString()}
              </span>
            </div>
            <FieldError message={errors.description} />
          </Section>

          <Section step={3} title="Media" hint="Optional - attach an image, a video, both, or neither">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <MediaField
                  kind="image"
                  current={report?.image ?? null}
                  file={imageFile}
                  removed={removeImage}
                  error={errors.image}
                  onPick={(f) => pick('image', f)}
                  onRemoveChange={setRemoveImage}
                />
                {showImageAlt && (
                  <div>
                    <Label htmlFor="rp-alt">Image description</Label>
                    <Input
                      id="rp-alt"
                      value={form.imageAlt}
                      onChange={(e) => patch({ imageAlt: e.target.value })}
                      placeholder="Screenshot of the error dialog"
                      maxLength={300}
                    />
                    <FormHint>Read aloud by screen readers. Defaults to the report title.</FormHint>
                  </div>
                )}
              </div>
              <MediaField
                kind="video"
                current={report?.video ?? null}
                file={videoFile}
                removed={removeVideo}
                error={errors.video}
                onPick={(f) => pick('video', f)}
                onRemoveChange={setRemoveVideo}
              />
            </div>
          </Section>

          <Section step={4} title="Publishing" hint="Drafts are only visible to administrators">
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl<Status>
                label="Publication status"
                value={form.status}
                onChange={(v) => patch({ status: v })}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                ]}
              />
              <p className="text-sm text-text-secondary">
                {form.status === 'published' ? 'Visible to everyone on the Reports page after saving.' : 'Hidden from the public until published.'}
              </p>
            </div>
          </Section>

          {progress !== null && saveMut.isPending && (
            <div className="rounded-lg border border-border bg-surface px-4 py-3" role="status" aria-live="polite">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-xs tabular-nums text-text-tertiary">
                {progress < 100 ? `Uploading media… ${progress}%` : 'Processing upload…'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg border border-border bg-surface px-4 py-3">
            {saveMut.isSuccess && !saveMut.isPending && (
              <span className="mr-auto inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <Check className="size-3.5" aria-hidden />
                Saved
              </span>
            )}
            <Button variant="ghost" onClick={() => navigate('/admin/reports')} disabled={saveMut.isPending}>
              Cancel
            </Button>
            <Button loading={saveMut.isPending} onClick={onSave}>
              {!saveMut.isPending && <Save className="size-4" aria-hidden />}
              {isNew ? 'Create report' : 'Save changes'}
            </Button>
          </div>
        </div>
      )}

      <DeleteReportModal
        report={confirmDelete && report ? report : null}
        pending={deleteMut.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMut.mutate()}
      />
    </div>
  );
}

function BackToReports() {
  return (
    <Link to="/admin/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text">
      <ArrowLeft className="size-4" aria-hidden />
      Reports
    </Link>
  );
}
