import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Flag,
  Award,
  BarChart3,
  ScrollText,
  Settings as SettingsIcon,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/card';

const navSections = [
  { label: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  { label: 'People', items: [{ to: '/admin/users', label: 'Users', icon: Users }] },
  {
    label: 'Content',
    items: [
      { to: '/admin/content', label: 'Learning content', icon: BookOpen },
      { to: '/admin/labs', label: 'Labs', icon: Flag },
      { to: '/admin/achievements', label: 'Achievements', icon: Award },
    ],
  },
  {
    label: 'Insight',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
      { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

export function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-bg-subtle">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <img src="/brand/logo-dark.png" alt="" className="size-7 dark:hidden" aria-hidden />
          <img src="/brand/logo-white.png" alt="" className="hidden size-7 dark:block" aria-hidden />
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight text-text">Suraksha Admin</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-text-tertiary">Shadow Security</p>
          </div>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? (item.end as boolean) : false}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-surface-2 hover:text-text',
                      )
                    }
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{user.name}</p>
              <Badge variant="accent" className="mt-1 capitalize">
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to platform
          </button>
        </div>
      </aside>
      <AdminMain />
    </div>
  );
}

function AdminMain() {
  const items = navSections.flatMap((s) => s.items);
  return (
    <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-surface px-4 py-2 lg:hidden" aria-label="Admin navigation">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? (item.end as boolean) : false}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-surface-2',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
