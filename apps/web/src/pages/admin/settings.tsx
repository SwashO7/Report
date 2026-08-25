import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Save } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormHint, Input, Label, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Skeleton } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface XpConfig {
  lesson_completion: number;
  practice_completion: number;
  first_attempt_bonus: number;
  no_hint_bonus: number;
}

interface PlatformConfig {
  registration_enabled: boolean;
  leaderboard_visible: boolean;
  flag_submission_cooldown_seconds: number;
  announcement: { enabled: boolean; message: string };
}

interface SettingsResponse {
  settings: {
    xp_config: XpConfig;
    platform_config: PlatformConfig;
  };
}

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Request failed. Please try again.');

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'ml-0.5 inline-block size-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-4.5',
        )}
      />
    </button>
  );
}

export default function AdminSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const settingsQ = useQuery({
    queryKey: qk.adminSettings,
    queryFn: () => api<SettingsResponse>('/admin/settings'),
  });

  const [xp, setXp] = useState<XpConfig>({ lesson_completion: 50, practice_completion: 25, first_attempt_bonus: 50, no_hint_bonus: 25 });
  const [platform, setPlatform] = useState<PlatformConfig>({
    registration_enabled: true,
    leaderboard_visible: true,
    flag_submission_cooldown_seconds: 30,
    announcement: { enabled: false, message: '' },
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const s = settingsQ.data?.settings;
    if (s && !initialized) {
      setXp({ ...s.xp_config });
      setPlatform({
        ...s.platform_config,
        announcement: {
          enabled: s.platform_config?.announcement?.enabled ?? false,
          message: s.platform_config?.announcement?.message ?? '',
        },
      });
      setInitialized(true);
    }
  }, [settingsQ.data, initialized]);

  const saveMut = useMutation({
    mutationFn: ({ key, value }: { key: 'xp_config' | 'platform_config'; value: unknown }) =>
      api('/admin/settings', { method: 'PATCH', body: { key, value } }),
    onSuccess: (_d, v) => {
      toast('success', v.key === 'xp_config' ? 'XP configuration saved' : 'Platform configuration saved');
      void qc.invalidateQueries({ queryKey: qk.adminSettings });
    },
    onError: (e) => toast('error', 'Save failed', errMsg(e)),
  });

  if (settingsQ.isError) {
    return (
      <div>
        <Header />
        <ErrorState
          description={errMsg(settingsQ.error)}
          action={
            <Button variant="outline" size="sm" onClick={() => void settingsQ.refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Header />

      {settingsQ.isLoading || !settingsQ.data ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>XP configuration</CardTitle>
              <CardDescription>Rewards granted for learning activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="xp-lesson">Lesson completion</Label>
                  <Input
                    id="xp-lesson"
                    type="number"
                    min={0}
                    max={10000}
                    value={xp.lesson_completion}
                    onChange={(e) => setXp({ ...xp, lesson_completion: Math.trunc(Number(e.target.value)) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="xp-practice">Practice completion</Label>
                  <Input
                    id="xp-practice"
                    type="number"
                    min={0}
                    max={10000}
                    value={xp.practice_completion}
                    onChange={(e) => setXp({ ...xp, practice_completion: Math.trunc(Number(e.target.value)) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="xp-first">First-attempt bonus</Label>
                  <Input
                    id="xp-first"
                    type="number"
                    min={0}
                    max={10000}
                    value={xp.first_attempt_bonus}
                    onChange={(e) => setXp({ ...xp, first_attempt_bonus: Math.trunc(Number(e.target.value)) || 0 })}
                  />
                  <FormHint>Awarded when a lab is solved on the first submission.</FormHint>
                </div>
                <div>
                  <Label htmlFor="xp-nohint">No-hint bonus</Label>
                  <Input
                    id="xp-nohint"
                    type="number"
                    min={0}
                    max={10000}
                    value={xp.no_hint_bonus}
                    onChange={(e) => setXp({ ...xp, no_hint_bonus: Math.trunc(Number(e.target.value)) || 0 })}
                  />
                  <FormHint>Awarded for solving a lab without revealing hints.</FormHint>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <FormHint>Changes apply platform-wide immediately.</FormHint>
                <Button loading={saveMut.isPending} onClick={() => saveMut.mutate({ key: 'xp_config', value: xp })}>
                  <Save className="size-4" aria-hidden />
                  Save XP config
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform configuration</CardTitle>
              <CardDescription>Global behavior toggles and announcements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Registration enabled</p>
                  <p className="text-xs text-text-tertiary">Allow new users to create accounts.</p>
                </div>
                <Switch
                  checked={platform.registration_enabled}
                  label="Toggle registration"
                  onChange={(v) => setPlatform({ ...platform, registration_enabled: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Leaderboard visible</p>
                  <p className="text-xs text-text-tertiary">Show the leaderboard to all learners.</p>
                </div>
                <Switch
                  checked={platform.leaderboard_visible}
                  label="Toggle leaderboard visibility"
                  onChange={(v) => setPlatform({ ...platform, leaderboard_visible: v })}
                />
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="w-56">
                  <Label htmlFor="pf-cooldown">Flag submission cooldown (seconds)</Label>
                  <Input
                    id="pf-cooldown"
                    type="number"
                    min={0}
                    max={3600}
                    value={platform.flag_submission_cooldown_seconds}
                    onChange={(e) =>
                      setPlatform({
                        ...platform,
                        flag_submission_cooldown_seconds: Math.max(0, Math.trunc(Number(e.target.value)) || 0),
                      })
                    }
                  />
                  <FormHint>Rate limit between flag submissions per user.</FormHint>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="size-4 text-text-tertiary" aria-hidden />
                    <div>
                      <p className="text-sm font-medium">Announcement banner</p>
                      <p className="text-xs text-text-tertiary">Shown across the learner dashboard.</p>
                    </div>
                  </div>
                  <Switch
                    checked={platform.announcement.enabled}
                    label="Toggle announcement"
                    onChange={(v) => setPlatform({ ...platform, announcement: { ...platform.announcement, enabled: v } })}
                  />
                </div>
                {platform.announcement.enabled && (
                  <div className="mt-3">
                    <Label htmlFor="pf-announcement">Message</Label>
                    <Textarea
                      id="pf-announcement"
                      value={platform.announcement.message}
                      onChange={(e) =>
                        setPlatform({ ...platform, announcement: { ...platform.announcement, message: e.target.value } })
                      }
                      className="min-h-[70px]"
                      placeholder="Scheduled maintenance this Saturday 02:00–04:00 UTC."
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <FormHint>Changes apply platform-wide immediately.</FormHint>
                <Button loading={saveMut.isPending} onClick={() => saveMut.mutate({ key: 'platform_config', value: platform })}>
                  <Save className="size-4" aria-hidden />
                  Save platform config
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">XP economy and platform-wide behavior.</p>
    </div>
  );
}
