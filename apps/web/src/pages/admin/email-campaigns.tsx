import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Ban, Eye, Mail, PencilLine, Plus, Send, Sparkles } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormHint, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Badge, type BadgeVariant, EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';

interface CampaignSummary {
  id: string;
  subject: string;
  audience: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  triggerKind: string | null;
}

interface CampaignDetail extends CampaignSummary {
  htmlBody: string;
  textBody: string;
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

const qkCampaigns = ['admin', 'email', 'campaigns'] as const;
const qkCampaign = (id: string) => ['admin', 'email', 'campaign', id] as const;
const qkRecipientCount = (id: string) => ['admin', 'email', 'campaign', id, 'recipients'] as const;

/** Plain-English descriptions of who each audience reaches. */
const AUDIENCES: { value: string; label: string; description: string }[] = [
  { value: 'all', label: 'Everyone', description: 'Every registered learner with a verified email.' },
  { value: 'active', label: 'Active learners', description: 'Learners who signed in within the last 30 days.' },
  { value: 'inactive', label: 'Inactive learners', description: 'Learners who have not signed in for 30+ days.' },
  { value: 'newsletter', label: 'Newsletter subscribers', description: 'Learners who opted in to product news and announcements.' },
  { value: 'staff', label: 'Staff & editors', description: 'Team members with an admin, editor or lab-manager role.' },
];

const audienceMeta = (value: string) => AUDIENCES.find((a) => a.value === value);

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  draft: 'default',
  scheduled: 'accent',
  sending: 'warning',
  sent: 'success',
  cancelled: 'outline',
  failed: 'danger',
};

function CampaignStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'default'} className="capitalize">
      {status}
    </Badge>
  );
}

/* ------------------------------ Editor modal ------------------------------ */

function CampaignEditor({ campaignId, onClose }: { campaignId: string | 'new'; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isNew = campaignId === 'new';

  const detailQ = useQuery({
    queryKey: qkCampaign(campaignId),
    queryFn: () => api<{ campaign: CampaignDetail }>(`/admin/email/campaigns/${campaignId}`),
    enabled: !isNew,
  });

  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [loaded, setLoaded] = useState(isNew);
  const [previewOpen, setPreviewOpen] = useState(false);

  const detail = detailQ.data?.campaign;
  useEffect(() => {
    if (detail && !loaded) {
      setSubject(detail.subject);
      setHtmlBody(detail.htmlBody);
      setTextBody(detail.textBody ?? '');
      setAudience(detail.audience);
      setLoaded(true);
    }
  }, [detail, loaded]);

  // Live recipient count for the selected audience.
  const countQ = useQuery({
    queryKey: [...qkRecipientCount(campaignId), audience],
    queryFn: () => api<{ count: number }>(`/admin/email/campaigns/${campaignId}/recipients/count`),
    enabled: !isNew,
  });

  const saveMut = useMutation({
    mutationFn: () =>
      isNew
        ? api<{ campaign: CampaignDetail }>('/admin/email/campaigns', {
            method: 'POST',
            body: { subject, htmlBody, textBody: textBody || undefined, audience },
          })
        : api<{ campaign: CampaignDetail }>(`/admin/email/campaigns/${campaignId}`, {
            method: 'PATCH',
            body: { subject, htmlBody, textBody: textBody || undefined, audience },
          }),
    onSuccess: () => {
      toast('success', isNew ? 'Campaign created' : 'Campaign saved');
      void qc.invalidateQueries({ queryKey: qkCampaigns });
      if (!isNew) void qc.invalidateQueries({ queryKey: qkCampaign(campaignId) });
      onClose();
    },
    onError: (e) => toast('error', 'Save failed', errMsg(e)),
  });

  const previewMut = useMutation({
    mutationFn: async () => htmlBody,
  });

  const canSave = subject.trim().length > 0 && htmlBody.trim().length > 0;
  const meta = audienceMeta(audience);

  return (
    <Modal open onClose={onClose} title={isNew ? 'New campaign' : `Edit campaign`} size="xl">
      <div className="space-y-4 p-5">
        {!isNew && detailQ.isLoading && <Skeleton className="h-40 w-full rounded-lg" />}

        {(isNew || loaded) && (
          <>
            <div>
              <Label htmlFor="ec-subject">Subject</Label>
              <Input id="ec-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="New labs just dropped 🔒" />
            </div>

            <div>
              <Label htmlFor="ec-audience">Audience</Label>
              <Select id="ec-audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
                {AUDIENCES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </Select>
              <FormHint>{meta?.description ?? 'Select who this campaign reaches.'}</FormHint>
            </div>

            {!isNew && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
                <Mail className="size-4 text-text-tertiary" aria-hidden />
                <span className="text-text-secondary">Reaches</span>
                <span className="font-semibold text-text">
                  {countQ.isLoading ? '…' : countQ.isError ? '—' : `${(countQ.data?.count ?? 0).toLocaleString()} recipient${countQ.data?.count === 1 ? '' : 's'}`}
                </span>
                <span className="text-text-tertiary">right now</span>
              </div>
            )}

            <div>
              <Label htmlFor="ec-html">HTML body</Label>
              <Textarea
                id="ec-html"
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                className="min-h-[220px] font-mono text-xs"
                spellCheck={false}
                placeholder="<h1>Hi there</h1><p>…</p>"
              />
              <FormHint>Rendered in a sandboxed preview only — never injected into this admin page.</FormHint>
            </div>

            <div>
              <Label htmlFor="ec-text">Plain-text body</Label>
              <Textarea
                id="ec-text"
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                className="min-h-[110px] font-mono text-xs"
                spellCheck={false}
                placeholder="Optional plain-text fallback."
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  previewMut.mutate();
                  setPreviewOpen(true);
                }}
                disabled={htmlBody.trim().length === 0}
              >
                <Eye className="size-4" aria-hidden />
                Preview
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => saveMut.mutate()} disabled={!canSave || saveMut.isPending} loading={saveMut.isPending}>
                {isNew ? 'Create campaign' : 'Save changes'}
              </Button>
            </div>
          </>
        )}
      </div>

      {previewOpen && (
        <Modal open onClose={() => setPreviewOpen(false)} title="Campaign preview" size="lg">
          <div className="space-y-3 p-5">
            <div>
              <Label>Subject</Label>
              <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text">{subject || '(no subject)'}</div>
            </div>
            <div>
              <Label>Rendered HTML</Label>
              <iframe
                title="Campaign HTML preview"
                sandbox=""
                srcDoc={htmlBody}
                className="h-96 w-full rounded-lg border border-border bg-white"
              />
              <FormHint>Sandboxed with scripts disabled.</FormHint>
            </div>
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

/* ------------------------------- Send modal ------------------------------- */

function SendModal({ campaign, onClose }: { campaign: CampaignSummary; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const countQ = useQuery({
    queryKey: qkRecipientCount(campaign.id),
    queryFn: () => api<{ count: number }>(`/admin/email/campaigns/${campaign.id}/recipients/count`),
  });
  const count = countQ.data?.count ?? campaign.recipientCount;

  const sendMut = useMutation({
    mutationFn: () => api<{ ok: true; recipientCount: number }>(`/admin/email/campaigns/${campaign.id}/send`, { method: 'POST' }),
    onSuccess: (res) => {
      toast('success', 'Campaign sending', `Delivering to ${res.recipientCount.toLocaleString()} recipient${res.recipientCount === 1 ? '' : 's'}.`);
      void qc.invalidateQueries({ queryKey: qkCampaigns });
      onClose();
    },
    onError: (e) => toast('error', 'Send failed', errMsg(e)),
  });

  return (
    <Modal open onClose={onClose} title="Send this campaign?" size="sm">
      <div className="space-y-4 p-5">
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text">{campaign.subject}</span> will be emailed to{' '}
          <span className="font-semibold text-text">
            {countQ.isLoading ? '…' : `${count.toLocaleString()} recipient${count === 1 ? '' : 's'}`}
          </span>{' '}
          in the <span className="font-medium text-text">{audienceMeta(campaign.audience)?.label ?? campaign.audience}</span> audience.
        </p>
        <div className="flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger-subtle px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <p className="text-sm text-danger">Sending starts delivery immediately and cannot be undone. Double-check the audience and content first.</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => sendMut.mutate()} loading={sendMut.isPending} disabled={countQ.isLoading}>
            <Send className="size-4" aria-hidden />
            Send to {countQ.isLoading ? '…' : count.toLocaleString()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function AdminEmailCampaignsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editId, setEditId] = useState<string | 'new' | null>(null);
  const [sendTarget, setSendTarget] = useState<CampaignSummary | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CampaignSummary | null>(null);

  const listQ = useQuery({
    queryKey: qkCampaigns,
    queryFn: () => api<{ campaigns: CampaignSummary[] }>('/admin/email/campaigns'),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => api<{ ok: true }>(`/admin/email/campaigns/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      toast('success', 'Campaign cancelled');
      void qc.invalidateQueries({ queryKey: qkCampaigns });
      setCancelTarget(null);
    },
    onError: (e) => toast('error', 'Cancel failed', errMsg(e)),
  });

  const campaigns = listQ.data?.campaigns ?? [];
  const total = campaigns.length;

  const canSend = (c: CampaignSummary) => c.status === 'draft' || c.status === 'scheduled';
  const canCancel = (c: CampaignSummary) => c.status === 'scheduled' || c.status === 'sending';
  const canEdit = (c: CampaignSummary) => c.status === 'draft' || c.status === 'scheduled';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Email campaigns</h1>
          <p className="mt-1 text-sm text-text-secondary">One-off announcements and newsletters sent to a chosen audience.</p>
        </div>
        <Button onClick={() => setEditId('new')}>
          <Plus className="size-4" aria-hidden />
          New campaign
        </Button>
      </header>

      {listQ.isError && (
        <ErrorState
          title="Could not load campaigns"
          description={errMsg(listQ.error)}
          action={
            <Button variant="outline" onClick={() => void listQ.refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {!listQ.isError && (
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH>Subject</TH>
                <TH>Audience</TH>
                <TH>Status</TH>
                <TH className="text-right">Recipients</TH>
                <TH className="text-right">Sent</TH>
                <TH>When</TH>
                <TH className="w-px">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {listQ.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TR key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TD key={j}>
                        <Skeleton className="h-4 w-full max-w-24" />
                      </TD>
                    ))}
                  </TR>
                ))}

              {!listQ.isLoading && total === 0 && (
                <TR>
                  <TD colSpan={7} className="py-16">
                    <EmptyState
                      icon={Mail}
                      title="No campaigns yet"
                      description="Create a campaign to announce new labs, courses or platform news."
                    />
                  </TD>
                </TR>
              )}

              {campaigns.map((c) => {
                const isGeneratedDraft = c.triggerKind === 'lab_published' && c.status === 'draft';
                return (
                  <TR key={c.id}>
                    <TD>
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="max-w-72 truncate font-medium text-text">{c.subject}</p>
                          {isGeneratedDraft && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                              <Sparkles className="size-3" aria-hidden />
                              Auto-generated draft — review before sending
                            </span>
                          )}
                        </div>
                      </div>
                    </TD>
                    <TD className="text-sm text-text-secondary">{audienceMeta(c.audience)?.label ?? c.audience}</TD>
                    <TD>
                      <CampaignStatusBadge status={c.status} />
                    </TD>
                    <TD className="text-right tabular-nums text-text-secondary">{c.recipientCount.toLocaleString()}</TD>
                    <TD className="text-right tabular-nums text-text-secondary">
                      {c.sentCount.toLocaleString()}
                      {c.failedCount > 0 && <span className="ml-1 text-danger">({c.failedCount} failed)</span>}
                    </TD>
                    <TD className="text-sm text-text-secondary">
                      {c.sentAt ? (
                        <span title={formatDate(c.sentAt)}>Sent {timeAgo(c.sentAt)}</span>
                      ) : c.scheduledFor ? (
                        <span title={formatDate(c.scheduledFor)}>Scheduled {formatDate(c.scheduledFor)}</span>
                      ) : (
                        <span title={formatDate(c.createdAt)}>Created {timeAgo(c.createdAt)}</span>
                      )}
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1.5">
                        {canEdit(c) && (
                          <Button variant="ghost" size="sm" onClick={() => setEditId(c.id)}>
                            <PencilLine className="size-3.5" aria-hidden />
                            Edit
                          </Button>
                        )}
                        {canSend(c) && (
                          <Button size="sm" onClick={() => setSendTarget(c)}>
                            <Send className="size-3.5" aria-hidden />
                            Send
                          </Button>
                        )}
                        {canCancel(c) && (
                          <Button variant="outline" size="sm" onClick={() => setCancelTarget(c)}>
                            <Ban className="size-3.5" aria-hidden />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableCard>
      )}

      {editId !== null && <CampaignEditor campaignId={editId} onClose={() => setEditId(null)} />}
      {sendTarget && <SendModal campaign={sendTarget} onClose={() => setSendTarget(null)} />}

      {cancelTarget && (
        <Modal open onClose={() => setCancelTarget(null)} title="Cancel this campaign?" size="sm">
          <div className="space-y-4 p-5">
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text">{cancelTarget.subject}</span> will stop{' '}
              {cancelTarget.status === 'sending' ? 'sending' : 'being scheduled'}. Emails already delivered cannot be recalled.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCancelTarget(null)}>
                Keep it
              </Button>
              <Button variant="danger" onClick={() => cancelMut.mutate(cancelTarget.id)} loading={cancelMut.isPending}>
                Cancel campaign
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
