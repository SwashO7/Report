import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, X, ShieldCheck, LayoutDashboard, BookOpen, PencilLine, Flag, Trophy, Settings, LogOut, User } from 'lucide-react';
import { useAuth, isAdminRole } from '@/lib/auth';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { Avatar, Badge } from '@/components/ui/card';
import { Dropdown, DropdownItem } from '@/components/ui/overlay';
import { cn, timeAgo } from '@/lib/utils';
import type { NotificationItem } from '@suraksha/shared';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: PencilLine },
  { to: '/labs', label: 'Labs', icon: Flag },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
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
        <span className="relative block rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text">
          <Bell className="size-5" aria-hidden />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
      }
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-sm font-semibold">Notifications</p>
        {unread > 0 && (
          <button onClick={() => markAll.mutate()} className="text-xs font-medium text-accent hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto pt-1">
        {(data?.notifications ?? []).length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-text-tertiary">You're all caught up.</p>
        ) : (
          data!.notifications.slice(0, 12).map((n) => (
            <button
              key={n.id}
              onClick={() => !n.readAt && markOne.mutate(n.id)}
              className={cn('flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-2', !n.readAt && 'bg-accent-subtle/50')}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className={cn('truncate text-sm', n.readAt ? 'text-text-secondary' : 'font-semibold text-text')}>{n.title}</span>
                {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-label="unread" />}
              </span>
              {n.body && <span className="line-clamp-2 text-xs text-text-tertiary">{n.body}</span>}
              <span className="text-[11px] text-text-tertiary">{timeAgo(n.createdAt)}</span>
            </button>
          ))
        )}
      </div>
    </Dropdown>
  );
}

export function LearnerShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="Suraksha Labs dashboard">
              <img src="/brand/logo-dark.png" alt="" className="size-7 dark:hidden" aria-hidden />
              <img src="/brand/logo-white.png" alt="" className="hidden size-7 dark:block" aria-hidden />
              <span className="hidden flex-col leading-none sm:flex">
                <span className="text-[15px] font-bold tracking-tight text-text">Suraksha Labs</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-tertiary">by Shadow Security</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-surface-2 text-text' : 'text-text-secondary hover:text-text',
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdminRole(user.role) && (
              <Link to="/admin" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text sm:flex">
                <ShieldCheck className="size-4" aria-hidden />
                Admin
              </Link>
            )}
            <NotificationsMenu />
            <Dropdown
              trigger={
                <span className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-2">
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                  <span className="hidden text-sm font-medium text-text md:block">{user.name.split(' ')[0]}</span>
                </span>
              }
            >
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-semibold text-text">{user.name}</p>
                <p className="text-xs text-text-tertiary">@{user.username}</p>
                {user.level && (
                  <Badge variant="accent" className="mt-1.5">
                    Level {user.level.order} — {user.level.name}
                  </Badge>
                )}
              </div>
              <div className="pt-1.5">
                <Link to={`/profile/${user.username}`}>
                  <DropdownItem icon={User}>My profile</DropdownItem>
                </Link>
                <Link to="/dashboard">
                  <DropdownItem icon={LayoutDashboard}>Dashboard</DropdownItem>
                </Link>
                <Link to="/settings">
                  <DropdownItem icon={Settings}>Settings</DropdownItem>
                </Link>
                <DropdownItem icon={LogOut} danger onClick={handleLogout}>
                  Sign out
                </DropdownItem>
              </div>
            </Dropdown>
            <button
              className="rounded-lg p-2 text-text-secondary hover:bg-surface-2 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border bg-surface px-4 py-3 lg:hidden" aria-label="Mobile">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text">
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </NavLink>
            ))}
            {isAdminRole(user.role) && (
              <NavLink to="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text">
                <ShieldCheck className="size-4" aria-hidden />
                Admin panel
              </NavLink>
            )}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
