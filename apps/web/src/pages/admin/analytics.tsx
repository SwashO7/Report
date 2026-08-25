import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import type { AdminStats } from '@suraksha/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Progress, Skeleton } from '@/components/ui/card';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { LineChart } from '@/features/admin/mini-chart';
import { StatusBadge } from '@/features/admin/status-badge';

interface LessonAnalyticsRow {
  slug: string;
  title: string;
  status: string;
  views: number;
  completions: number;
  completionRatePct: number;
}

function num(n: number): string {
  return new Intl.NumberFormat('en-US').format(n ?? 0);
}

export default function AdminAnalytics() {
  const stats = useQuery({ queryKey: qk.adminStats, queryFn: () => api<AdminStats>('/admin/stats') });
  const lessons = useQuery({
    queryKey: qk.adminLessonAnalytics,
    queryFn: () => api<{ lessons: LessonAnalyticsRow[] }>('/admin/analytics/lessons'),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-text-secondary">Content performance across lessons and labs.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={stats.isFetching || lessons.isFetching}
          onClick={() => {
            void stats.refetch();
            void lessons.refetch();
          }}
        >
          <RefreshCw className="size-4" aria-hidden />
          Refresh
        </Button>
      </div>

      {(stats.isError || lessons.isError) && (
        <div className="mb-6 space-y-4">
          {stats.isError && <ErrorState title="Could not load platform stats" action={<Button variant="outline" size="sm" onClick={() => void stats.refetch()}>Try again</Button>} />}
          {lessons.isError && <ErrorState title="Could not load lesson analytics" action={<Button variant="outline" size="sm" onClick={() => void lessons.refetch()}>Try again</Button>} />}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">Growth & engagement</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Signups</CardTitle>
              <CardDescription>New accounts per day</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.isLoading ? <Skeleton className="h-[180px] w-full rounded-lg" /> : <LineChart data={stats.data?.signupTrend ?? []} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Active sessions per day</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.isLoading ? <Skeleton className="h-[180px] w-full rounded-lg" /> : <LineChart data={stats.data?.activityTrend ?? []} />}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">Lesson performance</h2>
        <TableCard>
          <Table>
            <THead>
              <TR>
                <TH>Lesson</TH>
                <TH>Status</TH>
                <TH className="text-right">Views</TH>
                <TH className="text-right">Completions</TH>
                <TH className="w-56">Completion rate</TH>
              </TR>
            </THead>
            <TBody>
              {lessons.isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TR key={i}>
                    <TD colSpan={5}>
                      <Skeleton className="h-4 w-full max-w-md" />
                    </TD>
                  </TR>
                ))}
              {!lessons.isLoading && (lessons.data?.lessons.length ?? 0) === 0 && (
                <TR>
                  <TD colSpan={5} className="py-12 text-center text-text-tertiary">
                    No lesson analytics available yet.
                  </TD>
                </TR>
              )}
              {(lessons.data?.lessons ?? []).map((l) => (
                <TR key={l.slug}>
                  <TD>
                    <p className="max-w-72 truncate font-medium">{l.title}</p>
                    <p className="max-w-72 truncate font-mono text-xs text-text-tertiary">{l.slug}</p>
                  </TD>
                  <TD>
                    <StatusBadge status={l.status} />
                  </TD>
                  <TD className="text-right tabular-nums text-text-secondary">{num(l.views)}</TD>
                  <TD className="text-right tabular-nums text-text-secondary">{num(l.completions)}</TD>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Progress value={l.completionRatePct} className="h-1.5" label={`Completion rate ${Math.round(l.completionRatePct)}%`} />
                      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-text-secondary">{Math.round(l.completionRatePct)}%</span>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableCard>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">Lab performance</h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <TableCard className="xl:col-span-7">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-semibold tracking-tight">Popular labs</h3>
              <p className="mt-0.5 text-sm text-text-secondary">Most attempted labs</p>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Lab</TH>
                  <TH className="text-right">Attempts</TH>
                  <TH className="text-right">Solves</TH>
                </TR>
              </THead>
              <TBody>
                {!stats.data && stats.isLoading && (
                  <TR>
                    <TD colSpan={3}>
                      <Skeleton className="h-4 w-full" />
                    </TD>
                  </TR>
                )}
                {(stats.data?.popularLabs ?? []).map((l) => (
                  <TR key={l.slug}>
                    <TD className="max-w-64 truncate font-medium">{l.title}</TD>
                    <TD className="text-right tabular-nums">{num(l.attempts)}</TD>
                    <TD className="text-right tabular-nums text-success">{num(l.solves)}</TD>
                  </TR>
                ))}
                {stats.data && (stats.data.popularLabs.length ?? 0) === 0 && (
                  <TR>
                    <TD colSpan={3} className="py-10 text-center text-text-tertiary">
                      No lab attempts yet.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </TableCard>

          <TableCard className="xl:col-span-5">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="font-semibold tracking-tight">Hardest labs</h3>
              <p className="mt-0.5 text-sm text-text-secondary">Lowest solve rate</p>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Lab</TH>
                  <TH className="w-40">Solve rate</TH>
                </TR>
              </THead>
              <TBody>
                {!stats.data && stats.isLoading && (
                  <TR>
                    <TD colSpan={2}>
                      <Skeleton className="h-4 w-full" />
                    </TD>
                  </TR>
                )}
                {(stats.data?.hardestLabs ?? []).map((l) => (
                  <TR key={l.slug}>
                    <TD className="max-w-48 truncate font-medium">{l.title}</TD>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <Progress value={l.solveRatePct} className="h-1.5" label={`Solve rate ${Math.round(l.solveRatePct)}%`} />
                        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-text-secondary">{Math.round(l.solveRatePct)}%</span>
                      </div>
                    </TD>
                  </TR>
                ))}
                {stats.data && (stats.data.hardestLabs.length ?? 0) === 0 && (
                  <TR>
                    <TD colSpan={2} className="py-10 text-center text-text-tertiary">
                      No solve data yet.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </TableCard>
        </div>
      </section>
    </div>
  );
}
