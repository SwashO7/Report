import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BookOpen,
  FlaskConical,
  Gauge,
  LogOut,
  Menu,
  PencilLine,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  X,
} from 'lucide-react';
import type { NotificationItem } from '@suraksha/shared';
import { api } from '@/lib/api';
import { isStaffRole, useAuth } from '@/lib/auth';
import { qk } from '@/lib/queries';
import { cn, formatXp, timeAgo } from '@/lib/utils';
import { Avatar } from '@/components/ui/card';
import { Dropdown, DropdownItem } from '@/components/ui/overlay';

const navItems = [
  { to: '/dashboard', label: 'Today', icon: Gauge, end: true },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: PencilLine },
  { to: '/labs', label: 'Labs', icon: FlaskConical },
  { to: '/leaderboard', label: 'Rankings', icon: Trophy },
];

function NotificationsMenu() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: qk.notifications,
    queryFn: () => api<{ notifications: NotificationItem[]; unread: number }>('/me/notifications'),
    refetchInterval: 60_000,
  });
  const markAll = useMutation({
    mutationFn: () => api('/me/notifications/read-all', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.notifications }),
  });
  const markOne = useMutation({
    mutationFn: (id: string) => api(`/me/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.notifications }),
  });
  const unread = data?.unread ?? 0;

  return (
    <Dropdown
      trigger={
        <span className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text">
          <Bell className="size-[18px]" aria-hidden />
          {unread > 0 && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" aria-label={`${unread} unread notifications`} />}
        </span>
      }
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <p className="text-sm font-semibold">Updates</p>
        {unread > 0 && <button onClick={() => markAll.mutate()} className="text-xs font-medium text-accent">Mark read</button>}
      </div>
      <div className="max-h-80 overflow-y-auto pt-1">
        {(data?.notifications ?? []).length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-tertiary">Nothing needs your attention.</p>
        ) : data!.notifications.slice(0, 10).map((item) => (
          <button
            key={item.id}
            onClick={() => !item.readAt && markOne.mutate(item.id)}
            className={cn('block w-full rounded-md px-3 py-2.5 text-left hover:bg-surface-2', !item.readAt && 'bg-accent-subtle/40')}
          >
            <span className="block text-sm font-medium text-text">{item.title}</span>
            {item.body && <span className="mt-0.5 line-clamp-2 block text-xs text-text-secondary">{item.body}</span>}
            <span className="mt-1 block text-[11px] text-text-tertiary">{timeAgo(item.createdAt)}</span>
          </button>
        ))}
      </div>
    </Dropdown>
  );
}

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <img src="/brand/logo-white.png" alt="" className="size-8" aria-hidden />
      <span className="leading-none">
        <span className="block text-[15px] font-bold tracking-tight text-text">Suraksha Labs</span>
        <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.15em] text-text-tertiary">Shadow Security</span>
      </span>
    </span>
  );
}

export function LearnerShellV2() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  if (!user) return null;

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="app-grid min-h-[100dvh] bg-bg">
      <aside className="app-rail fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border lg:flex">
        <Link to="/dashboard" className="flex h-[76px] items-center border-b border-border px-5" aria-label="Suraksha Labs home">
          <Brand />
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Learning workspace">
          <p className="signal-label mb-3 px-3">Workspace</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'text-text-secondary hover:bg-surface-2 hover:text-text',
              )}
            >
              <item.icon className="size-[18px]" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mb-3 rounded-xl border border-border bg-bg-subtle p-3.5">
          <p className="signal-label">Current level</p>
          <p className="mt-2 text-sm font-semibold text-text">{user.level ? user.level.title : 'New learner'}</p>
          <p className="mt-1 font-mono text-xs text-text-tertiary">{formatXp(user.xp)} XP recorded</p>
        </div>

        <div className="border-t border-border p-3">
          {isStaffRole(user.role) && (
            <Link to="/admin" className="mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text">
              <ShieldCheck className="size-4" aria-hidden /> Admin workspace
            </Link>
          )}
          <Dropdown
            align="left"
            openUp
            trigger={
              <span className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2">
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text">{user.name}</span>
                  <span className="block truncate text-xs text-text-tertiary">@{user.username}</span>
                </span>
                <Menu className="size-4 text-text-tertiary" aria-hidden />
              </span>
            }
          >
            <Link to={`/profile/${user.username}`}><DropdownItem icon={User}>Profile</DropdownItem></Link>
            <Link to="/settings"><DropdownItem icon={Settings}>Settings</DropdownItem></Link>
            <DropdownItem icon={LogOut} danger onClick={signOut}>Sign out</DropdownItem>
          </Dropdown>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg/95 px-4 backdrop-blur-lg lg:hidden">
        <Link to="/dashboard" aria-label="Suraksha Labs home"><Brand /></Link>
        <div className="flex items-center gap-2">
          <NotificationsMenu />
          <button onClick={() => setMobileOpen((value) => !value)} className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary" aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-x-3 top-[4.5rem] z-50 rounded-xl border border-border bg-surface p-2 shadow-lg lg:hidden">
          <Link to="/leaderboard" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary"><Trophy className="size-4" /> Rankings</Link>
          <Link to={`/profile/${user.username}`} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary"><User className="size-4" /> My profile</Link>
          <Link to="/settings" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary"><Settings className="size-4" /> Settings</Link>
          {isStaffRole(user.role) && <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary"><ShieldCheck className="size-4" /> Admin workspace</Link>}
          <button onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-danger"><LogOut className="size-4" /> Sign out</button>
        </div>
      )}

      <div className="min-w-0 pb-24 lg:pb-0 lg:pl-64">
        <main className="min-h-[100dvh]"><Outlet /></main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-lg lg:hidden" aria-label="Primary navigation">
        {navItems.slice(0, 4).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('flex flex-col items-center gap-1 rounded-md py-1.5 text-[10px] font-medium', isActive ? 'text-accent' : 'text-text-tertiary')}>
            <item.icon className="size-5" aria-hidden />{item.label}
          </NavLink>
        ))}
        <Dropdown
          align="right"
          openUp
          trigger={
            <span className={cn('flex w-full flex-col items-center gap-1 rounded-md py-1.5 text-[10px] font-medium', location.pathname === `/profile/${user.username}` || location.pathname === '/settings' ? 'text-accent' : 'text-text-tertiary')}>
              <User className="size-5" aria-hidden />Profile
            </span>
          }
        >
          <Link to={`/profile/${user.username}`}><DropdownItem icon={User}>Profile</DropdownItem></Link>
          <Link to="/settings"><DropdownItem icon={Settings}>Settings</DropdownItem></Link>
        </Dropdown>
      </nav>

      <div className="fixed right-5 top-4 z-40 hidden lg:block"><NotificationsMenu /></div>
    </div>
  );
}
