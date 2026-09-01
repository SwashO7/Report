import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  KeyRound,
  Loader2,
  LogOut,
  MonitorSmartphone,
  Trash2,
  UserRound,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useSeo } from '@/lib/seo';
import { cn, timeAgo } from '@/lib/utils';
import { Avatar, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';

/* --------------------------------- Types ---------------------------------- */

interface NotificationChannel {
  inApp: boolean;
  email: boolean;
}

interface NotificationPreferences {
  preferences: Record<string, NotificationChannel>;
}

interface SessionInfo {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

const NOTIFICATION_LABELS: Record<string, string> = {
  lab_completed: 'Lab completions',
  achievement_unlocked: 'Achievements',
  rank_milestone: 'Rank milestones',
  new_lab: 'New labs',
  new_lesson: 'New lessons',
  streak_reminder: 'Streak reminders',
};

function prefLabel(type: string): string {
  if (NOTIFICATION_LABELS[type]) return NOTIFICATION_LABELS[type];
  return type
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function deviceLabel(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad|iPod/.test(ua)
        ? 'iOS'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : '';
  return os ? `${browser} · ${os}` : browser;
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}

/* --------------------------------- Switch --------------------------------- */

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-150',
        checked ? 'bg-accent' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] size-[18px] rounded-full bg-white shadow-xs transition-[left] duration-150',
          checked ? 'left-[20px]' : 'left-[2px]',
        )}
      />
    </button>
  );
}

/* ------------------------------- Profile card ------------------------------ */

function ProfileCard() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [visibility, setVisibility] = useState<string>(user?.profileVisibility ?? 'public');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setUsername(user.username);
    setBio(user.bio ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
    setVisibility(user.profileVisibility);
  }, [user]);

  const save = useMutation({
    mutationFn: () =>
      api<{ user: unknown }>('/me/profile', {
        method: 'PATCH',
        body: { name: name.trim(), username: username.trim(), bio: bio.trim(), avatarUrl: avatarUrl.trim(), profileVisibility: visibility },
      }),
    onSuccess: async () => {
      setError(null);
      await refresh();
      toast('success', 'Profile updated');
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const resend = useMutation({
    mutationFn: () => api('/auth/resend-verification', { method: 'POST' }),
    onSuccess: () => toast('success', 'Verification email sent', 'Check your inbox — it may take a minute to arrive.'),
    onError: (err) => toast('error', 'Could not resend verification email', errorMessage(err)),
  });

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4 text-accent" aria-hidden />
          Profile
        </CardTitle>
        <CardDescription>How you appear across Suraksha Labs.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <Avatar name={name || user.username} src={avatarUrl || null} size="lg" className="ring-2 ring-border" />
            <p className="text-xs leading-relaxed text-text-tertiary">
              Paste an image URL below to change your avatar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="settings-name">Full name</Label>
              <Input id="settings-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="settings-username">Username</Label>
              <Input id="settings-username" value={username} maxLength={32} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="settings-bio">Bio</Label>
            <Textarea
              id="settings-bio"
              placeholder="A line or two about who you are…"
              value={bio}
              maxLength={280}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="settings-avatar">Avatar URL</Label>
            <Input
              id="settings-avatar"
              type="url"
              placeholder="https://…"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className="sm:max-w-xs">
            <Label htmlFor="settings-visibility">Profile visibility</Label>
            <Select id="settings-visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Public — anyone can view</option>
              <option value="private">Private — only you</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="settings-email">Email</Label>
            <div className="flex flex-wrap items-center gap-2.5">
              <Input id="settings-email" value={user.email} readOnly disabled className="max-w-xs bg-surface-2 font-mono text-[13px]" />
              {user.emailVerified ? (
                <Badge variant="success">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Verified
                </Badge>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={resend.isPending}
                  onClick={() => resend.mutate()}
                >
                  Resend verification
                </Button>
              )}
            </div>
          </div>

          <FieldError message={error ?? undefined} />

          <div className="border-t border-border pt-4">
            <Button type="submit" loading={save.isPending} disabled={!name.trim() || !username.trim()}>
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Password card ------------------------------ */

function PasswordCard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Google-authenticated accounts without a local password have nothing to change here.
  if (!user) return null;
  if (user.authProvider === 'google') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-accent" aria-hidden />
            Password
          </CardTitle>
          <CardDescription>Sign-in method for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-text-secondary">
            You signed up with Google, so you sign in through Google and don't have a Suraksha Labs password.
          </p>
        </CardContent>
      </Card>
    );
  }

  const change = useMutation({
    mutationFn: () =>
      api('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      toast('success', 'Password updated', 'Use your new password next time you sign in.');
    },
    onError: (err) => setError(errorMessage(err)),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setError(null);
    change.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4 text-accent" aria-hidden />
          Password
        </CardTitle>
        <CardDescription>Choose a strong, unique password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
          <div>
            <Label htmlFor="settings-current-password">Current password</Label>
            <Input
              id="settings-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="settings-new-password">New password</Label>
            <Input
              id="settings-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="settings-confirm-password">Confirm new password</Label>
            <Input
              id="settings-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <FieldError message={error ?? undefined} />

          <Button type="submit" loading={change.isPending} disabled={!currentPassword || !newPassword}>
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* --------------------------- Notification prefs card ----------------------- */

function NotificationPreferencesCard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: qk.notificationPrefs,
    queryFn: () => api<NotificationPreferences>('/me/notification-preferences'),
    staleTime: 60_000,
  });

  const update = useMutation({
    mutationFn: (next: NotificationPreferences) =>
      api('/me/notification-preferences', { method: 'PATCH', body: next }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.notificationPrefs }),
  });

  const entries = Object.entries(data?.preferences ?? {}).sort(([a], [b]) => {
    const ai = Object.keys(NOTIFICATION_LABELS).indexOf(a);
    const bi = Object.keys(NOTIFICATION_LABELS).indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  function toggle(type: string, channel: keyof NotificationChannel, value: boolean) {
    if (!data) return;
    const current = data.preferences[type] ?? { inApp: true, email: false };
    update.mutate({
      preferences: { ...data.preferences, [type]: { ...current, [channel]: value } },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4 text-accent" aria-hidden />
          Notification preferences
        </CardTitle>
        <CardDescription>Decide what we tell you about, and where.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-text-secondary">No notification categories available yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            <li className="flex items-center gap-3 pb-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              <span className="min-w-0 flex-1">Event</span>
              <span className="w-16 shrink-0 text-center">In-app</span>
              <span className="w-16 shrink-0 text-center">Email</span>
            </li>
            {entries.map(([type, channel]) => (
              <li key={type} className="flex items-center gap-3 py-3 first:border-t-0">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{prefLabel(type)}</span>
                <span className="flex w-16 shrink-0 justify-center">
                  <Switch
                    checked={channel.inApp}
                    label={`${prefLabel(type)} in-app notifications`}
                    onChange={(v) => toggle(type, 'inApp', v)}
                  />
                </span>
                <span className="flex w-16 shrink-0 justify-center">
                  <Switch
                    checked={channel.email}
                    label={`${prefLabel(type)} email notifications`}
                    onChange={(v) => toggle(type, 'email', v)}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------- Sessions card ----------------------------- */

function SessionsCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: qk.sessions,
    queryFn: () => api<{ sessions: SessionInfo[] }>('/auth/sessions'),
    staleTime: 30_000,
  });

  const revoke = useMutation({
    mutationFn: (id: string) => api(`/auth/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.sessions });
      toast('success', 'Session revoked', 'That device has been signed out.');
    },
    onError: (err) => toast('error', 'Could not revoke session', errorMessage(err)),
  });

  const sessions = data?.sessions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MonitorSmartphone className="size-4 text-accent" aria-hidden />
          Active sessions
        </CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState title="No active sessions found" description="Sign in again to see this device listed." />
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-tertiary">
                  <MonitorSmartphone className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-text">
                    <span className="truncate">{deviceLabel(session.userAgent)}</span>
                    {session.current && (
                      <Badge variant="accent" className="shrink-0 px-2 py-0 text-[11px]">
                        This device
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-text-tertiary">
                    Active {timeAgo(session.lastActiveAt)}
                    {session.ip ? ` · ${session.ip}` : ''}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={revoke.isPending && revoke.variables === session.id}
                    onClick={() => revoke.mutate(session.id)}
                  >
                    <LogOut className="size-3.5" aria-hidden />
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------- Danger zone ------------------------------ */

function DangerZoneCard() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const deleteAccount = useMutation({
    mutationFn: () => api('/me/account', { method: 'DELETE' }),
    onSuccess: async () => {
      setConfirmOpen(false);
      await refresh();
      await logout();
      navigate('/');
    },
    onError: (err) => {
      setConfirmOpen(false);
      toast('error', 'Could not delete account', errorMessage(err));
    },
  });

  if (!user) return null;

  return (
    <>
      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="size-4" aria-hidden />
            Danger zone
          </CardTitle>
          <CardDescription>Irreversible actions. Proceed with care.</CardDescription>
        </CardHeader>
        <CardContent className="sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm font-medium text-text">Delete account</p>
            <p className="mt-0.5 max-w-md text-sm leading-relaxed text-text-secondary">
              Permanently removes your account, progress, XP, and achievements. This cannot be undone.
            </p>
          </div>
          <Button variant="danger" className="mt-4 shrink-0 sm:mt-0" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" aria-hidden />
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete your account?" size="md">
        <div className="space-y-4 px-5 py-5">
          <p className="rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-3 text-sm leading-relaxed text-danger">
            This permanently deletes <strong>{user.name}</strong> (@{user.username}) along with all progress, XP,
            achievements, and lab attempts. There is no way back.
          </p>
          <div>
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono font-semibold text-text">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            {deleteAccount.isPending ? (
              <Button variant="danger" disabled>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Deleting…
              </Button>
            ) : (
              <Button variant="danger" disabled={confirmText !== 'DELETE'} onClick={() => deleteAccount.mutate()}>
                <Trash2 className="size-4" aria-hidden />
                Delete forever
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ---------------------------------- Page ----------------------------------- */

export default function SettingsPage() {
  useSeo('Settings — Suraksha Labs');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text">Settings</h1>
        <p className="mt-2 text-base text-text-secondary">Manage your profile, security, and notifications.</p>
      </header>

      <div className="mt-8 space-y-6 pb-16">
        <ProfileCard />
        <PasswordCard />
        <NotificationPreferencesCard />
        <SessionsCard />
        <DangerZoneCard />
      </div>
    </div>
  );
}
