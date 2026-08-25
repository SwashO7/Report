import { Fragment, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { cn, formatDate } from '@/lib/utils';
import type { AuditLogEntry } from '@suraksha/shared';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge, ErrorState, Skeleton } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/overlay';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import type { Pagination } from '@suraksha/shared';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function AdminAudit() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [pageSize, setPageSize] = useState('25');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(search), 350);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [q, pageSize]);

  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  params.set('page', String(page));
  params.set('pageSize', pageSize);
  const qs = params.toString();

  const auditQ = useQuery({
    queryKey: qk.adminAudit(qs),
    queryFn: () => api<{ entries: AuditLogEntry[]; pagination: Pagination }>(`/admin/audit?${qs}`),
  });

  const rows = auditQ.data?.entries ?? [];
  const pg = auditQ.data?.pagination;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-1 text-sm text-text-secondary">Every privileged action, recorded.</p>
        </div>
        <Button variant="outline" size="sm" loading={auditQ.isFetching} onClick={() => void auditQ.refetch()}>
          <RefreshCw className="size-4" aria-hidden />
          Refresh
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by action…"
            className="pl-9"
            aria-label="Filter by action"
          />
        </div>
        <Select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
          aria-label="Rows per page"
          className="w-32"
        >
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </Select>
      </div>

      {auditQ.isError ? (
        <ErrorState
          description="The audit endpoint returned an error."
          action={
            <Button variant="outline" size="sm" onClick={() => void auditQ.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH className="w-10" />
                <TH>Time</TH>
                <TH>Actor</TH>
                <TH>Action</TH>
                <TH>Entity</TH>
                <TH className="text-right">IP (hashed)</TH>
              </TR>
            </THead>
            <TBody>
              {auditQ.isLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <TR key={i}>
                    <TD colSpan={6}>
                      <Skeleton className="h-4 w-full" />
                    </TD>
                  </TR>
                ))}
              {!auditQ.isLoading && rows.length === 0 && (
                <TR>
                  <TD colSpan={6} className="py-12 text-center text-text-tertiary">
                    No audit entries match the current filter.
                  </TD>
                </TR>
              )}
              {rows.map((entry) => {
                const expanded = expandedId === entry.id;
                return (
                  <Fragment key={entry.id}>
                    <TR>
                      <TD>
                        {entry.metadata && Object.keys(entry.metadata).length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : entry.id)}
                            aria-label={expanded ? 'Collapse metadata' : 'Expand metadata'}
                            aria-expanded={expanded}
                            className="rounded p-0.5 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
                          >
                            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </button>
                        ) : null}
                      </TD>
                      <TD className="whitespace-nowrap text-sm text-text-secondary">
                        <Tooltip label={`${formatDate(entry.createdAt)} ${formatTime(entry.createdAt)}`}>
                          <span>{formatDate(entry.createdAt)} · {formatTime(entry.createdAt)}</span>
                        </Tooltip>
                      </TD>
                      <TD>
                        {entry.actor ? (
                          <span className="text-sm">
                            <span className="font-medium">{entry.actor.name}</span>{' '}
                            <span className="text-text-tertiary">@{entry.actor.username}</span>
                          </span>
                        ) : (
                          <Badge variant="default">System</Badge>
                        )}
                      </TD>
                      <TD>
                        <Badge variant="accent" className="font-mono normal-case">
                          {entry.action}
                        </Badge>
                      </TD>
                      <TD>
                        <span className="font-mono text-xs text-text-secondary">
                          {entry.entityType}
                          {entry.entityId ? ` · ${entry.entityId.slice(0, 12)}${entry.entityId.length > 12 ? '…' : ''}` : ''}
                        </span>
                      </TD>
                      <TD className="text-right">
                        <span className="font-mono text-xs text-text-tertiary">{entry.ipHash ?? '—'}</span>
                      </TD>
                    </TR>
                    {expanded && (
                      <TR key={`${entry.id}-meta`} className={cn('bg-surface-2/60 hover:bg-surface-2/60')}>
                        <TD colSpan={6}>
                          <pre className="max-w-full overflow-x-auto rounded-lg bg-surface-3 p-3 font-mono text-xs leading-relaxed">
                            {JSON.stringify({ metadata: entry.metadata }, null, 2)}
                          </pre>
                        </TD>
                      </TR>
                    )}
                  </Fragment>
                );
              })}
            </TBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
            <span>{pg ? `${pg.total.toLocaleString()} entries` : ''}</span>
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
    </div>
  );
}
