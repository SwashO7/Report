import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, EyeOff, ExternalLink, Minus, MoreVertical, PencilLine, Plus, Search, Send, Trash2 } from 'lucide-react';
import type { AdminReportRow, Pagination } from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { formatDate, timeAgo } from '@/lib/utils';
import { StatusBadge } from '@/features/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { ErrorState, Skeleton } from '@/components/ui/card';
import { Dropdown, DropdownItem, Tooltip } from '@/components/ui/overlay';
import { DeleteReportModal } from '@/features/reports/delete-report-modal';
import { useToast } from '@/components/ui/toast';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

function Present({ on, label }: { on: boolean; label: string }) {
  return on ? (
    <Tooltip label={`${label} attached`}>
      <Check className="size-4 text-success" aria-label={`${label} attached`} />
    </Tooltip>
  ) : (
    <Tooltip label={`No ${label.toLowerCase()}`}>
      <Minus className="size-4 text-text-tertiary" aria-label={`No ${label.toLowerCase()}`} />
    </Tooltip>
  );
}

export default function AdminReports() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminReportRow | null>(null);

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

  const reportsQ = useQuery({
    queryKey: qk.adminReports(qs),
    queryFn: () => api<{ reports: AdminReportRow[]; pagination: Pagination }>(`/admin/reports?${qs}`),
    placeholderData: (previous) => previous,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
    void qc.invalidateQueries({ queryKey: ['reports'] });
  };

  const statusMut = useMutation({
    mutationFn: ({ id, to }: { id: string; to: 'draft' | 'published' }) =>
      api(`/admin/reports/${id}/status`, { method: 'POST', body: { status: to } }),
    onSuccess: (_d, v) => {
      toast('success', v.to === 'published' ? 'Report published' : 'Report unpublished');
      invalidate();
    },
    onError: (e) => toast('error', 'Status change failed', errMsg(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api(`/admin/reports/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Report deleted');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e) => toast('error', 'Delete failed', errMsg(e)),
  });

  const rows = reportsQ.data?.reports ?? [];
  const pg = reportsQ.data?.pagination;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-text-secondary">Write and publish public bug, vulnerability and incident reports.</p>
        </div>
        <Button onClick={() => navigate('/admin/reports/new')}>
          <Plus className="size-4" aria-hidden />
          New report
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports…" className="pl-9" aria-label="Search reports" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="w-44">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      {reportsQ.isError ? (
        <ErrorState
          title="Could not load reports"
          description={errMsg(reportsQ.error)}
          action={
            <Button variant="outline" size="sm" onClick={() => void reportsQ.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH>Report</TH>
                <TH>Status</TH>
                <TH className="text-center">Image</TH>
                <TH className="text-center">Video</TH>
                <TH>Published</TH>
                <TH>Updated</TH>
                <TH className="w-12" />
              </TR>
            </THead>
            <TBody>
              {reportsQ.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TR key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TD key={j}>
                        <Skeleton className="h-4 w-full max-w-24" />
                      </TD>
                    ))}
                  </TR>
                ))}
              {!reportsQ.isLoading && rows.length === 0 && (
                <TR>
                  <TD colSpan={7} className="py-12 text-center text-text-tertiary">
                    {q || status !== 'all' ? 'No reports match the current filters.' : 'No reports yet. Create the first one.'}
                  </TD>
                </TR>
              )}
              {rows.map((r) => (
                <TR key={r.id}>
                  <TD>
                    <button
                      onClick={() => navigate(`/admin/reports/${r.id}`)}
                      className="block max-w-72 truncate text-left font-medium transition-colors hover:text-accent"
                    >
                      {r.title}
                    </button>
                    <p className="max-w-72 truncate font-mono text-xs text-text-tertiary">/reports/{r.slug}</p>
                  </TD>
                  <TD>
                    <StatusBadge status={r.status} />
                  </TD>
                  <TD>
                    <span className="flex justify-center">
                      <Present on={r.hasImage} label="Image" />
                    </span>
                  </TD>
                  <TD>
                    <span className="flex justify-center">
                      <Present on={r.hasVideo} label="Video" />
                    </span>
                  </TD>
                  <TD className="whitespace-nowrap text-sm text-text-secondary">{r.publishedAt ? formatDate(r.publishedAt) : '—'}</TD>
                  <TD className="whitespace-nowrap text-sm text-text-secondary">{timeAgo(r.updatedAt)}</TD>
                  <TD>
                    <Dropdown
                      trigger={
                        <span
                          className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
                          aria-label={`Actions for ${r.title}`}
                        >
                          <MoreVertical className="size-4" aria-hidden />
                        </span>
                      }
                    >
                      <DropdownItem icon={PencilLine} onClick={() => navigate(`/admin/reports/${r.id}`)}>
                        Edit
                      </DropdownItem>
                      <DropdownItem icon={ExternalLink} onClick={() => window.open(`/reports/${r.slug}`, '_blank', 'noopener')}>
                        {r.status === 'published' ? 'View public page' : 'Preview'}
                      </DropdownItem>
                      {r.status === 'published' ? (
                        <DropdownItem icon={EyeOff} onClick={() => statusMut.mutate({ id: r.id, to: 'draft' })}>
                          Unpublish
                        </DropdownItem>
                      ) : (
                        <DropdownItem icon={Send} onClick={() => statusMut.mutate({ id: r.id, to: 'published' })}>
                          Publish
                        </DropdownItem>
                      )}
                      <DropdownItem danger icon={Trash2} onClick={() => setDeleteTarget(r)}>
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm text-text-secondary">
            <span>{pg ? `${pg.total.toLocaleString()} report${pg.total === 1 ? '' : 's'}` : ''}</span>
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

      <DeleteReportModal
        report={deleteTarget}
        pending={deleteMut.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
      />
    </div>
  );
}
