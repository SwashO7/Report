import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Check,
  ChevronRight,
  Minus,
  MoreVertical,
  Package,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { cn, formatXp, timeAgo } from '@/lib/utils';
import { LAB_WORKFLOW, StatusBadge } from '@/features/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge, ErrorState, Skeleton } from '@/components/ui/card';
import { Dropdown, DropdownItem, Modal, Tooltip } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import type { Pagination } from '@suraksha/shared';

interface AdminLabRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  visibility: string;
  version: number;
  packageVersion: string | null;
  category: string;
  difficulty: string;
  xpReward: number;
  estimatedMinutes: number;
  attemptCount: number;
  solveCount: number;
  downloadCount: number;
  hasPackage: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');
const STATUS_OPTIONS = ['draft', 'internal_testing', 'security_review', 'ready', 'published', 'archived'] as const;

export default function AdminLabs() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [transitionTarget, setTransitionTarget] = useState<{ lab: AdminLabRow; to: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLabRow | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  const labsQ = useQuery({
    queryKey: qk.adminLabs(qs),
    queryFn: () => api<{ labs: AdminLabRow[]; pagination: Pagination }>(`/admin/labs?${qs}`),
  });

  const invalidateLabs = () => void qc.invalidateQueries({ queryKey: ['admin', 'labs'] });

  const statusMut = useMutation({
    mutationFn: ({ id, to }: { id: string; to: string }) =>
      api(`/admin/labs/${id}/status`, { method: 'POST', body: { status: to } }),
    onSuccess: (_d, v) => {
      toast('success', v.to === 'published' ? 'Lab published' : `Status updated to ${v.to.replace(/_/g, ' ')}`);
      setTransitionTarget(null);
      invalidateLabs();
    },
    onError: (e) => toast('error', 'Status change rejected', errMsg(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api(`/admin/labs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Lab deleted');
      setDeleteTarget(null);
      setDeleteConfirmText('');
      invalidateLabs();
    },
    onError: (e) => toast('error', 'Delete failed', errMsg(e)),
  });

  const rows = labsQ.data?.labs ?? [];
  const pg = labsQ.data?.pagination;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Labs</h1>
          <p className="mt-1 text-sm text-text-secondary">Author, review and publish hands-on lab environments.</p>
        </div>
        <Button onClick={() => navigate('/admin/labs/new')}>
          <Plus className="size-4" aria-hidden />
          New lab
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search labs…"
            className="pl-9"
            aria-label="Search labs"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="w-44">
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
      </div>

      {labsQ.isError ? (
        <ErrorState
          description={errMsg(labsQ.error)}
          action={
            <Button variant="outline" size="sm" onClick={() => void labsQ.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH>Lab</TH>
                <TH>Category</TH>
                <TH>Difficulty</TH>
                <TH className="text-right">XP</TH>
                <TH className="text-right">Solves / attempts</TH>
                <TH>Package</TH>
                <TH>Status</TH>
                <TH>Updated</TH>
                <TH className="w-12" />
              </TR>
            </THead>
            <TBody>
              {labsQ.isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TR key={i}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <TD key={j}>
                        <Skeleton className="h-4 w-full max-w-20" />
                      </TD>
                    ))}
                  </TR>
                ))}
              {!labsQ.isLoading && rows.length === 0 && (
                <TR>
                  <TD colSpan={9} className="py-12 text-center text-text-tertiary">
                    No labs match the current filters.
                  </TD>
                </TR>
              )}
              {rows.map((lab) => {
                const next = LAB_WORKFLOW[lab.status];
                return (
                  <TR key={lab.id}>
                    <TD>
                      <p className="max-w-56 truncate font-medium">{lab.title}</p>
                      <p className="max-w-56 truncate font-mono text-xs text-text-tertiary">{lab.slug}</p>
                    </TD>
                    <TD className="text-sm capitalize text-text-secondary">{lab.category}</TD>
                    <TD className="text-sm capitalize text-text-secondary">{lab.difficulty}</TD>
                    <TD className="text-right font-medium tabular-nums">{formatXp(lab.xpReward)}</TD>
                    <TD className="text-right tabular-nums text-sm text-text-secondary">
                      <span className="text-success">{lab.solveCount.toLocaleString()}</span> /{' '}
                      {lab.attemptCount.toLocaleString()}
                    </TD>
                    <TD>
                      {lab.hasPackage ? (
                        <Tooltip label={`Package v${lab.packageVersion ?? '?'}`}>
                          <span className="inline-flex items-center gap-1 text-sm text-success">
                            <Check className="size-4" aria-hidden />
                            <span className="font-mono text-xs">v{lab.packageVersion ?? '?'}</span>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip label="No package uploaded">
                          <Minus className="size-4 text-text-tertiary" aria-hidden />
                        </Tooltip>
                      )}
                    </TD>
                    <TD>
                      <StatusBadge status={lab.status} />
                    </TD>
                    <TD className="text-sm text-text-secondary">{timeAgo(lab.updatedAt)}</TD>
                    <TD>
                      <Dropdown
                        trigger={
                          <span className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text">
                            <MoreVertical className="size-4" aria-hidden />
                          </span>
                        }
                      >
                        <DropdownItem icon={PencilLine} onClick={() => navigate(`/admin/labs/${lab.id}`)}>
                          Edit
                        </DropdownItem>
                        <DropdownItem icon={BarChart3} onClick={() => navigate(`/admin/labs/${lab.id}?tab=analytics`)}>
                          Analytics
                        </DropdownItem>
                        {next && (
                          <DropdownItem icon={ChevronRight} onClick={() => setTransitionTarget({ lab, to: next.to })}>
                            {next.label}
                          </DropdownItem>
                        )}
                        {lab.status !== 'published' && (
                          <DropdownItem danger icon={Trash2} onClick={() => setDeleteTarget(lab)}>
                            Delete
                          </DropdownItem>
                        )}
                      </Dropdown>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
            <span>{pg ? `${pg.total.toLocaleString()} labs` : ''}</span>
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

      <Modal
        open={!!transitionTarget}
        onClose={() => setTransitionTarget(null)}
        title={transitionTarget?.to === 'published' ? 'Publish lab' : 'Update lab status'}
        size="sm"
      >
        <div className="space-y-4 p-5">
          {transitionTarget?.to === 'published' ? (
            <p className="text-sm text-text-secondary">
              Publishing makes <span className="font-medium text-text">{transitionTarget.lab.title}</span> visible and playable by all
              learners. Make sure the security review is complete.
            </p>
          ) : (
            <p className="text-sm text-text-secondary">
              Move <span className="font-medium text-text">{transitionTarget?.lab.title}</span> to{' '}
              <Badge variant="accent" className="capitalize">
                {transitionTarget?.to.replace(/_/g, ' ')}
              </Badge>
              ?
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTransitionTarget(null)}>
              Cancel
            </Button>
            <Button
              loading={statusMut.isPending}
              onClick={() =>
                transitionTarget && statusMut.mutate({ id: transitionTarget.lab.id, to: transitionTarget.to })
              }
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete lab" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            This permanently deletes the lab, its package reference and configuration. Type{' '}
            <span className="font-mono font-medium text-text">{deleteTarget?.slug}</span> to confirm.
          </p>
          <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder={deleteTarget?.slug} className={cn('font-mono')} aria-label="Type lab slug to confirm" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMut.isPending}
              disabled={deleteConfirmText !== deleteTarget?.slug}
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
            >
              Delete forever
            </Button>
          </div>
        </div>
      </Modal>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
        <Package className="size-3.5" aria-hidden />
        Workflow: draft → internal testing → security review → ready → published
      </div>
    </div>
  );
}
