import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/learn', label: 'Curriculum' },
  { to: '/labs', label: 'Labs' },
  { to: '/practice', label: 'Practice' },
  { to: '/leaderboard', label: 'Community' },
  { to: '/reports', label: 'Reports' },
];

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <img src="/brand/logo-white.png" alt="" className="size-8" aria-hidden />
      <span className="leading-none">
        <span className="block text-[15px] font-bold tracking-tight text-text">Suraksha Labs</span>
        <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-text-tertiary">Shadow Security</span>
      </span>
    </span>
  );
}

export function PublicLayoutV2() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="app-grid flex min-h-[100dvh] flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Suraksha Labs home"><Brand /></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-surface-2 text-text' : 'text-text-secondary hover:text-text')}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {!loading && (user ? (
              <Link to="/dashboard"><Button size="sm">Open workspace <ArrowRight className="size-4" /></Button></Link>
            ) : (
              <><Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link><Link to="/signup"><Button size="sm">Start free</Button></Link></>
            ))}
          </div>
          <button onClick={() => setOpen((value) => !value)} className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary md:hidden" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-border bg-surface px-4 py-3 md:hidden" aria-label="Mobile navigation">
            {nav.map((item) => <NavLink key={item.to} to={item.to} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary">{item.label}</NavLink>)}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              {user ? (
                <><Link to="/dashboard"><Button className="w-full" size="sm">Workspace</Button></Link><Button variant="outline" size="sm" onClick={() => void logout()}>Sign out</Button></>
              ) : (
                <><Link to="/login"><Button className="w-full" variant="outline" size="sm">Sign in</Button></Link><Link to="/signup"><Button className="w-full" size="sm">Start free</Button></Link></>
              )}
            </div>
          </nav>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-border bg-bg-subtle">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
          <div><Brand /><p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">Practical cybersecurity education built around understanding, repetition, and proof.</p></div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary" aria-label="Footer">{nav.map((item) => <Link key={item.to} to={item.to} className="hover:text-text">{item.label}</Link>)}</nav>
        </div>
        <div className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-4 font-mono text-[11px] text-text-tertiary sm:px-6"><span>© {new Date().getFullYear()} Shadow Security</span><span>Learn responsibly. Practice locally.</span></div></div>
      </footer>
    </div>
  );
}
