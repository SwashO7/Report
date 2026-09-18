import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Lock, Mail, PencilLine, Save } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormHint, Input, Label, Textarea } from '@/components/ui/input';
import { Badge, Card, CardContent, EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  enabled: boolean;
  transactional: boolean;
  updatedAt: string;
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

const qkEmailTemplates = ['admin', 'email', 'templates'] as const;
const qkEmailTemplate = (key: string) => ['admin', 'email', 'template', key] as const;

/* -------------------------------- Toggle --------------------------------- */

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-accent' : 'bg-border-strong',
      )}
    >
      <span className={cn('ml-0.5 inline-block size-4 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
    </button>
  );
}

/* ------------------------------ Editor modal ------------------------------ */

function TemplateEditor({ template, onClose }: { template: EmailTemplate; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [subject, setSubject] = useState(template.subject);
  const [htmlBody, setHtmlBody] = useState(template.htmlBody);
  const [textBody, setTextBody] = useState(template.textBody);
  const [enabled, setEnabled] = useState(template.enabled);

  const subjectRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [activeField, setActiveField] = useState<'subject' | 'htmlBody' | 'textBody'>('htmlBody');

  const [previewVars, setPreviewVars] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.variables.map((v) => [v, ''])),
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const saveMut = useMutation({
    mutationFn: () =>
      api<{ template: EmailTemplate }>(`/admin/email/templates/${template.key}`, {
        method: 'PATCH',
        body: {
          name,
          description,
          subject,
          htmlBody,
          textBody,
          ...(template.transactional ? {} : { enabled }),
        },
      }),
    onSuccess: () => {
      toast('success', 'Template saved');
      void qc.invalidateQueries({ queryKey: qkEmailTemplates });
      void qc.invalidateQueries({ queryKey: qkEmailTemplate(template.key) });
      onClose();
    },
    onError: (e) => toast('error', 'Save failed', errMsg(e)),
  });

  const previewMut = useMutation({
    mutationFn: () =>
      api<{ html: string; subject: string }>(`/admin/email/templates/${template.key}/preview`, {
        method: 'POST',
        body: { variables: previewVars },
      }),
  });

  function insertVariable(variable: string) {
    const token = `{{${variable}}}`;
    const map = {
      subject: { ref: subjectRef.current, value: subject, set: setSubject },
      htmlBody: { ref: htmlRef.current, value: htmlBody, set: setHtmlBody },
      textBody: { ref: textRef.current, value: textBody, set: setTextBody },
    } as const;
    const target = map[activeField];
    const el = target.ref;
    if (!el) {
      target.set(target.value + token);
      return;
    }
    const start = el.selectionStart ?? target.value.length;
    const end = el.selectionEnd ?? target.value.length;
    const next = target.value.slice(0, start) + token + target.value.slice(end);
    target.set(next);
    // Restore focus + caret after React re-renders.
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  }

  const canSave = name.trim().length >= 2 && subject.trim().length > 0 && htmlBody.trim().length > 0;

  return (
    <Modal open onClose={onClose} title={`Edit template: ${template.key}`} size="xl">
      <div className="space-y-4 p-5">
        {template.transactional && (
          <div className="flex items-start gap-2.5 rounded-lg border border-border-strong bg-surface-2 px-4 py-3">
            <Lock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <div>
              <p className="text-sm font-medium text-text">Transactional email</p>
              <p className="text-xs text-text-tertiary">
                This message is triggered by a user action (sign-up, password reset). It cannot be disabled — only its wording can change.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="et-name">Name</Label>
            <Input id="et-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Welcome email" />
          </div>
          <div>
            <Label htmlFor="et-desc">Description</Label>
            <Input id="et-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Sent after a learner verifies their email" />
          </div>
        </div>

        {template.variables.length > 0 && (
          <div>
            <Label>Available variables</Label>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
            <FormHint>Click a variable to insert it at the cursor of the field you last edited ({activeField === 'htmlBody' ? 'HTML body' : activeField === 'textBody' ? 'text body' : 'subject'}).</FormHint>
          </div>
        )}

        <div>
          <Label htmlFor="et-subject">Subject</Label>
          <Input
            id="et-subject"
            ref={subjectRef}
            value={subject}
            onFocus={() => setActiveField('subject')}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Welcome to Suraksha Labs, {{name}}"
          />
        </div>

        <div>
          <Label htmlFor="et-html">HTML body</Label>
          <Textarea
            id="et-html"
            ref={htmlRef}
            value={htmlBody}
            onFocus={() => setActiveField('htmlBody')}
            onChange={(e) => setHtmlBody(e.target.value)}
            className="min-h-[220px] font-mono text-xs"
            spellCheck={false}
            placeholder="<p>Hi {{name}}, …</p>"
          />
          <FormHint>Rendered in a sandboxed preview only — never injected into this admin page.</FormHint>
        </div>

        <div>
          <Label htmlFor="et-text">Plain-text body</Label>
          <Textarea
            id="et-text"
            ref={textRef}
            value={textBody}
            onFocus={() => setActiveField('textBody')}
            onChange={(e) => setTextBody(e.target.value)}
            className="min-h-[120px] font-mono text-xs"
            spellCheck={false}
            placeholder="Hi {{name}}, …"
          />
          <FormHint>Fallback for email clients that do not render HTML.</FormHint>
        </div>

        {!template.transactional && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3">
            <Toggle checked={enabled} onChange={setEnabled} label="Toggle enabled" />
            <div>
              <p className="text-sm font-medium text-text">{enabled ? 'Enabled' : 'Disabled'}</p>
              <p className="text-xs text-text-tertiary">A disabled template is skipped — the email is not sent.</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => {
              previewMut.reset();
              setPreviewOpen(true);
            }}
          >
            <Eye className="size-4" aria-hidden />
            Preview
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => saveMut.mutate()} disabled={!canSave || saveMut.isPending} loading={saveMut.isPending}>
            <Save className="size-4" aria-hidden />
            Save changes
          </Button>
        </div>
      </div>

      {previewOpen && (
        <Modal open onClose={() => setPreviewOpen(false)} title={`Preview: ${template.name}`} size="lg">
          <div className="space-y-4 p-5">
            {template.variables.length > 0 && (
              <div>
                <Label>Sample values</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {template.variables.map((v) => (
                    <div key={v}>
                      <label htmlFor={`pv-${v}`} className="mb-1 block font-mono text-xs text-text-secondary">
                        {`{{${v}}}`}
                      </label>
                      <Input
                        id={`pv-${v}`}
                        value={previewVars[v] ?? ''}
                        onChange={(e) => setPreviewVars((p) => ({ ...p, [v]: e.target.value }))}
                        placeholder="Sample value"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Button size="sm" onClick={() => previewMut.mutate()} loading={previewMut.isPending}>
                    Render preview
                  </Button>
                </div>
              </div>
            )}
            {template.variables.length === 0 && (
              <Button size="sm" onClick={() => previewMut.mutate()} loading={previewMut.isPending}>
                Render preview
              </Button>
            )}

            {previewMut.isError && <p className="text-sm text-danger">{errMsg(previewMut.error)}</p>}

            {previewMut.data && (
              <div className="space-y-2">
                <div>
                  <Label>Rendered subject</Label>
                  <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text">{previewMut.data.subject}</div>
                </div>
                <div>
                  <Label>Rendered HTML</Label>
                  <iframe
                    title="Email HTML preview"
                    sandbox=""
                    srcDoc={previewMut.data.html}
                    className="h-96 w-full rounded-lg border border-border bg-white"
                  />
                  <FormHint>Sandboxed with scripts disabled — this is exactly what the email client receives.</FormHint>
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-border pt-4">
              <Button variant="ghost" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function AdminEmailTemplatesPage() {
  const [editKey, setEditKey] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const listQ = useQuery({
    queryKey: qkEmailTemplates,
    queryFn: () => api<{ templates: EmailTemplate[] }>('/admin/email/templates'),
  });

  const templates = useMemo(() => {
    const items = listQ.data?.templates ?? [];
    if (!q.trim()) return items;
    const needle = q.toLowerCase();
    return items.filter(
      (t) => t.name.toLowerCase().includes(needle) || t.key.toLowerCase().includes(needle) || t.subject.toLowerCase().includes(needle),
    );
  }, [listQ.data, q]);

  const editing = listQ.data?.templates.find((t) => t.key === editKey) ?? null;
  const total = listQ.data?.templates.length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Email templates</h1>
        <p className="mt-1 text-sm text-text-secondary">
          The wording of every automated email. Transactional messages (sign-up, password reset) can be reworded but not turned off.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates…" className="max-w-xs" aria-label="Search templates" />
        <span className="text-xs text-text-tertiary">{total} total</span>
      </div>

      {listQ.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      )}

      {listQ.isError && (
        <ErrorState
          title="Could not load templates"
          description={errMsg(listQ.error)}
          action={
            <Button variant="outline" onClick={() => void listQ.refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {listQ.data && total === 0 && (
        <EmptyState icon={Mail} title="No email templates" description="Templates are seeded by the platform. None are configured yet." />
      )}

      {listQ.data && total > 0 && templates.length === 0 && (
        <EmptyState icon={Mail} title="No matching templates" description="Try a different search term." />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex h-full flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{t.name}</p>
                  <p className="truncate font-mono text-[11px] text-text-tertiary">{t.key}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {t.transactional ? (
                    <Badge variant="accent">
                      <Lock className="size-3" aria-hidden />
                      Transactional
                    </Badge>
                  ) : t.enabled ? (
                    <Badge variant="success">Enabled</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>
              </div>

              <p className="line-clamp-2 text-sm text-text-secondary">{t.description || 'No description'}</p>

              <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary">Subject</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-text">{t.subject}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {t.variables.slice(0, 4).map((v) => (
                  <span key={v} className="rounded font-mono text-[10px] text-text-tertiary">{`{{${v}}}`}</span>
                ))}
                {t.variables.length > 4 && <span className="text-[10px] text-text-tertiary">+{t.variables.length - 4} more</span>}
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-text-tertiary">Updated {timeAgo(t.updatedAt)}</span>
                <Button variant="outline" size="sm" onClick={() => setEditKey(t.key)}>
                  <PencilLine className="size-3.5" aria-hidden />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && <TemplateEditor template={editing} onClose={() => setEditKey(null)} />}
    </div>
  );
}
