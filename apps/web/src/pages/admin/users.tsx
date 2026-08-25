import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BadgeCheck,
  Ban,
  Coins,
  MailX,
  MoreVertical,
  PlayCircle,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { cn, formatXp, formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { Avatar, Badge, type BadgeVariant } from '@/components/ui/card';
import { Dropdown, DropdownItem, Modal, Tooltip } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import type { Pagination } from '@suraksha/shared';

const ROLES = ['learner', 'content_editor', 'lab_manager', 'moderator', 'administrator', 'super_admin'] as const;

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  learner: 'outline',
  content_editor: 'accent',
  lab_manager: 'accent',
  moderator: 'default',
  administrator: 'warning',
  super_admin: 'danger',
};

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active: 'success',
  suspended: 'danger',
  deleted: 'default',
};

interface AdminUserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  xp: number;
  emailVerified: boolean;
  authProvider: string;
  createdAt: string;
  lastActiveAt: string | null;
}

interface UsersResponse {
  users: AdminUserRow[];
  pagination: Pagination;
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const me = useAuth();
  const isSuper = me.user?.role === 'super_admin';

  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [roleTarget, setRoleTarget] = useState<AdminUserRow | null>(null);
  const [roleValue, setRoleValue] = useState<string>('learner');
  const [suspendTarget, setSuspendTarget] = useState<AdminUserRow | null>(null);
  const [xpTarget, setXpTarget] = useState<AdminUserRow | null>(null);
  const [xpAmount, setXpAmount] = useState('');
  const [xpReason, setXpReason] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQ(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [q, role, status, sort]);

  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (role !== 'all') params.set('role', role);
  if (status !== 'all') params.set('status', status);
  params.set('sort', sort);
  params.set('page', String(page));
  params.set('pageSize', '25');
  const qs = params.toString();

  const usersQ = useQuery({
    queryKey: qk.adminUsers(qs),
    queryFn: () => api<UsersResponse>(`/admin/users?${qs}`),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  const patchMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api(`/admin/users/${id}`, { method: 'PATCH', body }),
    onSuccess: (_d, v) => {
      toast('success', 'User updated');
      invalidate();
      if ('role' in v.body) setRoleTarget(null);
      if ('status' in v.body) setSuspendTarget(null);
    },
    onError: (e) => toast('error', 'Update failed', errMsg(e)),
  });

  const xpMut = useMutation({
    mutationFn: (body: { userId: string; amount: number; reason: string }) =>
      api('/admin/users/xp-adjust', { method: 'POST', body }),
    onSuccess: () => {
      toast('success', 'XP adjusted');
      setXpTarget(null);
      setXpAmount('');
      setXpReason('');
      invalidate();
    },
    onError: (e) => toast('error', 'Adjustment failed', errMsg(e)),
  });

  const rows = usersQ.data?.users ?? [];
  const pg = usersQ.data?.pagination;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage accounts, roles and platform standing.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username or email…"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" className="w-40">
          <option value="all">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace('_', ' ')}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="w-36">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="w-36">
          <option value="newest">Newest</option>
          <option value="xp">Top XP</option>
          <option value="name">Name</option>
        </Select>
      </div>

      <TableCard>
        <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH className="text-right">XP</TH>
              <TH>Last active</TH>
              <TH>Created</TH>
              <TH className="w-12" />
            </TR>
          </THead>
          <TBody>
            {usersQ.isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TR key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TD key={j}>
                      <div className="skeleton h-4 w-full max-w-28" />
                    </TD>
                  ))}
                </TR>
              ))}
            {!usersQ.isLoading && rows.length === 0 && (
              <TR>
                <TD colSpan={8} className="py-12 text-center text-text-tertiary">
                  No users match the current filters.
                </TD>
              </TR>
            )}
            {rows.map((u) => (
              <TR key={u.id} className={cn(u.status !== 'active' && 'opacity-70')}>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="truncate text-xs text-text-tertiary">@{u.username}</p>
                    </div>
                  </div>
                </TD>
                <TD>
                  <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                    <span className="max-w-48 truncate">{u.email}</span>
                    {u.emailVerified ? (
                      <Tooltip label="Email verified">
                        <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Email verified" />
                      </Tooltip>
                    ) : (
                      <Tooltip label="Not verified">
                        <MailX className="size-4 shrink-0 text-text-tertiary" aria-label="Email not verified" />
                      </Tooltip>
                    )}
                  </span>
                </TD>
                <TD>
                  <Badge variant={ROLE_VARIANT[u.role] ?? 'outline'} className="capitalize">
                    {u.role.replace('_', ' ')}
                  </Badge>
                </TD>
                <TD>
                  <Badge variant={STATUS_VARIANT[u.status] ?? 'default'} className="capitalize">
                    {u.status}
                  </Badge>
                </TD>
                <TD className="text-right font-medium tabular-nums">{formatXp(u.xp)}</TD>
                <TD className="text-sm text-text-secondary">{u.lastActiveAt ? timeAgo(u.lastActiveAt) : '—'}</TD>
                <TD className="text-sm text-text-secondary">{formatDate(u.createdAt)}</TD>
                <TD>
                  <Dropdown
                    trigger={
                      <span className="flex size-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text">
                        <MoreVertical className="size-4" aria-hidden />
                      </span>
                    }
                  >
                    {isSuper && u.role !== 'deleted' && (
                      <DropdownItem
                        icon={ShieldCheck}
                        onClick={() => {
                          setRoleValue(u.role);
                          setRoleTarget(u);
                        }}
                      >
                        Change role
                      </DropdownItem>
                    )}
                    {isSuper && (
                      <DropdownItem icon={Coins} onClick={() => setXpTarget(u)}>
                        Adjust XP
                      </DropdownItem>
                    )}
                    {u.status !== 'deleted' && (
                      <DropdownItem icon={BadgeCheck} onClick={() => patchMut.mutate({ id: u.id, body: { emailVerified: !u.emailVerified } })}>
                        {u.emailVerified ? 'Unverify email' : 'Verify email'}
                      </DropdownItem>
                    )}
                    {u.status === 'active' && (
                      <DropdownItem danger icon={Ban} onClick={() => setSuspendTarget(u)}>
                        Suspend
                      </DropdownItem>
                    )}
                    {u.status === 'suspended' && (
                      <DropdownItem icon={PlayCircle} onClick={() => patchMut.mutate({ id: u.id, body: { status: 'active' } })}>
                        Reactivate
                      </DropdownItem>
                    )}
                  </Dropdown>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
          <span>{pg ? `${pg.total.toLocaleString()} users` : ''}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={!pg || page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="tabular-nums">
              Page {pg?.page ?? page}{pg && pg.totalPages > 0 ? ` of ${pg.totalPages}` : ''}
            </span>
            <Button variant="outline" size="sm" disabled={!pg || page >= pg.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </TableCard>

      <Modal open={!!roleTarget} onClose={() => setRoleTarget(null)} title="Change role" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            Change the platform role for <span className="font-medium text-text">@{roleTarget?.username}</span>.
          </p>
          <div>
            <Label htmlFor="user-role">Role</Label>
            <Select id="user-role" value={roleValue} onChange={(e) => setRoleValue(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button loading={patchMut.isPending} onClick={() => roleTarget && patchMut.mutate({ id: roleTarget.id, body: { role: roleValue } })}>
              Save role
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!suspendTarget} onClose={() => setSuspendTarget(null)} title="Suspend account" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            Suspend <span className="font-medium text-text">@{suspendTarget?.username}</span>? They will be signed out and blocked from
            signing in until reactivated. Progress is preserved.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={patchMut.isPending}
              onClick={() => suspendTarget && patchMut.mutate({ id: suspendTarget.id, body: { status: 'suspended' } })}
            >
              Suspend user
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!xpTarget} onClose={() => setXpTarget(null)} title="Adjust XP" size="sm">
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">
            Manually adjust XP for <span className="font-medium text-text">@{xpTarget?.username}</span>. Use a negative amount to deduct.
            The adjustment is recorded in the audit log.
          </p>
          <div>
            <Label htmlFor="xp-amount">Amount</Label>
            <Input
              id="xp-amount"
              type="number"
              value={xpAmount}
              onChange={(e) => setXpAmount(e.target.value)}
              placeholder="e.g. 250 or -100"
            />
          </div>
          <div>
            <Label htmlFor="xp-reason">Reason</Label>
            <Textarea
              id="xp-reason"
              value={xpReason}
              onChange={(e) => setXpReason(e.target.value)}
              placeholder="Why is this adjustment being made?"
              className="min-h-[72px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setXpTarget(null)}>
              Cancel
            </Button>
            <Button
              loading={xpMut.isPending}
              disabled={!xpAmount || xpReason.trim().length < 3 || Number.isNaN(Number(xpAmount))}
              onClick={() =>
                xpTarget &&
                xpMut.mutate({ userId: xpTarget.id, amount: Math.trunc(Number(xpAmount)), reason: xpReason.trim() })
              }
            >
              Apply adjustment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
