import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth, isStaffRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/card';
import { Dropdown, DropdownItem } from '@/components/ui/overlay';
import { cn } from '@/lib/utils';

function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/brand/logo-dark.png" alt="" className="size-7 dark:hidden" aria-hidden />
      <img src="/brand/logo-white.png" alt="" className="hidden size-7 dark:block" aria-hidden />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-text">Suraksha Labs</span>
        <span className="mt-[7px] text-[9.5px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
          by Shadow Security
        </span>
      </span>
    </span>
  );
}

const navItems = [
  { to: '/learn', label: 'Learn' },
  { to: '/practice', label: 'Practice' },
  { to: '/labs', label: 'Labs' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export function PublicLayout() {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="Suraksha Labs home" className="shrink-0">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm transition-colors',
                    isActive ? 'font-semibold text-text' : 'font-medium text-text-secondary hover:text-text',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {loading ? null : user ? (
              <>
                {isStaffRole(user.role) && (
                  <Link
                    to="/admin"
                    className="mr-1 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <ShieldCheck className="size-4" aria-hidden />
                    Admin
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
                <Dropdown
                  trigger={<Avatar name={user.name} src={user.avatarUrl} size="sm" className="ring-2 ring-border transition hover:ring-accent/40" />}
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-sm font-semibold text-text">{user.name}</p>
                    <p className="text-xs text-text-tertiary">@{user.username}</p>
                  </div>
                  <div className="pt-1.5">
                    <Link to={`/profile/${user.username}`}>
                      <DropdownItem>My profile</DropdownItem>
                    </Link>
                    <Link to="/settings">
                      <DropdownItem>Settings</DropdownItem>
                    </Link>
                    <DropdownItem danger onClick={() => void logout()}>
                      Sign out
                    </DropdownItem>
                  </div>
                </Dropdown>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Start learning</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-md p-2 text-text-secondary hover:bg-surface-2 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-0.5" aria-label="Mobile">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2.5 text-sm',
                      isActive ? 'bg-surface-2 font-semibold text-text' : 'font-medium text-text-secondary hover:bg-surface-2 hover:text-text',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex-1">
                      <Button className="w-full" size="sm">Dashboard</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => void logout()}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/signup" className="flex-1">
                      <Button className="w-full" size="sm">
                        Start learning
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
          <div>
            <BrandMark />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-tertiary">
              Free, practical cybersecurity training. Learn responsibly.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm text-text-secondary" aria-label="Footer">
            <Link to="/learn" className="hover:text-text">Learn</Link>
            <Link to="/practice" className="hover:text-text">Practice</Link>
            <Link to="/labs" className="hover:text-text">Labs</Link>
            <Link to="/leaderboard" className="hover:text-text">Leaderboard</Link>
          </nav>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-text-tertiary sm:px-6">
            <span>© {new Date().getFullYear()} Shadow Security</span>
            <span>Suraksha Labs is free forever.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
