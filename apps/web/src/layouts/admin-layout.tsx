import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Image as ImageIcon,
  Mail,
  Flag,
  FileWarning,
  Award,
  BarChart3,
  ScrollText,
  Settings as SettingsIcon,
  ArrowLeft,
} from 'lucide-react';
import { useAuth, isEditorRole, isLabManagerRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  /** Mirrors the server-side RBAC gates for each sub-router. */
  visibleFor: 'all' | 'editor' | 'labmgr' | 'admin';
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, visibleFor: 'all' }],
  },
  {
    label: 'People',
    items: [{ to: '/admin/users', label: 'Users', icon: Users, visibleFor: 'admin' }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/content', label: 'Learning content', icon: BookOpen, visibleFor: 'editor' },
      { to: '/admin/practice', label: 'Practice', icon: ClipboardCheck, visibleFor: 'editor' },
      { to: '/admin/diagrams', label: 'Diagrams', icon: ImageIcon, visibleFor: 'editor' },
      { to: '/admin/labs', label: 'Labs', icon: Flag, visibleFor: 'labmgr' },
      { to: '/admin/reports', label: 'Reports', icon: FileWarning, visibleFor: 'admin' },
      { to: '/admin/email/templates', label: 'Email', icon: Mail, visibleFor: 'admin' },
      { to: '/admin/achievements', label: 'Achievements', icon: Award, visibleFor: 'admin' },
    ],
  },
  {
    label: 'Insight',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, visibleFor: 'all' },
      { to: '/admin/audit', label: 'Audit log', icon: ScrollText, visibleFor: 'all' },
      { to: '/admin/settings', label: 'Settings', icon: SettingsIcon, visibleFor: 'admin' },
    ],
  },
];

function canSee(item: NavItem, role: string): boolean {
  if (item.visibleFor === 'all') return true;
  if (role === 'administrator' || role === 'super_admin') return true;
  if (item.visibleFor === 'editor') return isEditorRole(role);
  if (item.visibleFor === 'labmgr') return isLabManagerRole(role);
  return false;
}

export function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const sections = navSections
    .map((s) => ({ ...s, items: s.items.filter((i) => canSee(i, user.role)) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-[60px] items-center gap-2.5 border-b border-border px-5">
          <img src="/brand/logo-dark.png" alt="" className="size-7 dark:hidden" aria-hidden />
          <img src="/brand/logo-white.png" alt="" className="hidden size-7 dark:block" aria-hidden />
          <div className="leading-none">
            <p className="text-sm font-bold tracking-tight text-text">Suraksha Admin</p>
            <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.16em] text-text-tertiary">Shadow Security</p>
          </div>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end ?? false}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-3 py-[7px] text-sm transition-colors',
                        isActive ? 'bg-accent-subtle font-semibold text-accent' : 'font-medium text-text-secondary hover:bg-surface-2 hover:text-text',
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
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{user.name}</p>
              <p className="text-xs capitalize text-text-tertiary">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to platform
          </button>
        </div>
      </aside>
      <AdminMain items={sections.flatMap((s) => s.items)} />
    </div>
  );
}

function AdminMain({ items }: { items: NavItem[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col lg:pl-56">
      <div
        className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-4 py-2 lg:hidden"
        aria-label="Admin navigation"
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
                isActive ? 'bg-accent-subtle font-semibold text-accent' : 'font-medium text-text-secondary hover:bg-surface-2',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
