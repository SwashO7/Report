import { useQuery } from '@tanstack/react-query';
import { BookOpen, FlaskConical, Flame, RefreshCw, Users, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import type { AdminStats } from '@suraksha/shared';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Progress,
  Skeleton,
  SkeletonCard,
} from '@/components/ui/card';
import { Table, TableCard, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { LineChart } from '@/features/admin/mini-chart';

function num(n: number | null | undefined): string {
  return new Intl.NumberFormat('en-US').format(n ?? 0);
}

function Stat({
  icon: Icon,
  label,
  value,
  foot,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  foot?: ReactNode;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">{label}</p>
          <Icon className="size-4 shrink-0 text-text-tertiary" aria-hidden />
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-24" />
        ) : (
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-text">{value}</p>
        )}
        {!loading && foot && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">{foot}</div>}
      </CardContent>
    </Card>
  );
}

function Foot({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-medium text-text">{value}</span>
      <span className="text-xs text-text-tertiary">{label}</span>
    </span>
  );
}

export default function AdminDashboard() {
  const stats = useQuery({ queryKey: qk.adminStats, queryFn: () => api<AdminStats>('/admin/stats') });
  const d = stats.data;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">Platform health, growth and content performance at a glance.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void stats.refetch()} loading={stats.isFetching}>
          <RefreshCw className="size-4" aria-hidden />
          Refresh
        </Button>
      </div>

      {stats.isError ? (
        <ErrorState
          title="Could not load stats"
          description="The admin stats endpoint returned an error."
          action={
            <Button variant="outline" size="sm" onClick={() => void stats.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <Stat
                icon={Users}
                label="Users"
                value={num(d?.users.total)}
                loading={stats.isLoading}
                foot={
                  <>
                    <Foot label="active 7d" value={num(d?.users.active7d)} />
                    <Foot label="active 30d" value={num(d?.users.active30d)} />
                    <Foot label="new 30d" value={num(d?.users.new30d)} />
                  </>
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <Stat
                icon={Flame}
                label="Engagement"
                value={num(d?.engagement.dau)}
                loading={stats.isLoading}
                foot={
                  <>
                    <Foot label="WAU" value={num(d?.engagement.wau)} />
                    <Foot label="MAU" value={num(d?.engagement.mau)} />
                    <Foot label="avg streak" value={`${d?.engagement.avgStreak ?? 0}d`} />
                  </>
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <Stat
                icon={FlaskConical}
                label="Labs"
                value={num(d?.labs.attempts)}
                loading={stats.isLoading}
                foot={
                  <>
                    <Foot label="solves" value={num(d?.labs.solves)} />
                    <Foot label="completion" value={`${Math.round(d?.labs.completionRate ?? 0)}%`} />
                    <Foot label="avg to solve" value={d?.labs.avgHoursToSolve != null ? `${d.labs.avgHoursToSolve.toFixed(1)}h` : '—'} />
                  </>
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6 xl:col-span-3">
              <Stat
                icon={BookOpen}
                label="Live content"
                value={num((d?.content.publishedLessons ?? 0) + (d?.content.publishedLabs ?? 0))}
                loading={stats.isLoading}
                foot={
                  <>
                    <Foot label="lessons live/draft" value={`${d?.content.publishedLessons ?? 0}/${d?.content.draftLessons ?? 0}`} />
                    <Foot label="labs live/draft" value={`${d?.content.publishedLabs ?? 0}/${d?.content.draftLabs ?? 0}`} />
                  </>
                }
              />
            </div>
          </div>

          {stats.isLoading || !d ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Signups</CardTitle>
                  <CardDescription>New accounts per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart data={d.signupTrend} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>Active sessions per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart data={d.activityTrend} />
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <TableCard className="xl:col-span-7">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="font-semibold tracking-tight">Popular labs</h3>
                <p className="mt-0.5 text-sm text-text-secondary">Most attempted labs</p>
              </div>
              <Table>
                <THead>
                  <TR>
                    <TH className="w-10">#</TH>
                    <TH>Lab</TH>
                    <TH className="text-right">Attempts</TH>
                    <TH className="text-right">Solves</TH>
                  </TR>
                </THead>
                <TBody>
                  {stats.isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TR key={i}>
                          <TD colSpan={4}>
                            <Skeleton className="h-4 w-full" />
                          </TD>
                        </TR>
                      ))
                    : (d?.popularLabs ?? []).map((l, i) => (
                        <TR key={l.slug}>
                          <TD className="text-text-tertiary">{i + 1}</TD>
                          <TD className="max-w-56 truncate font-medium">{l.title}</TD>
                          <TD className="text-right tabular-nums">{num(l.attempts)}</TD>
                          <TD className="text-right tabular-nums text-success">{num(l.solves)}</TD>
                        </TR>
                      ))}
                  {!stats.isLoading && (d?.popularLabs.length ?? 0) === 0 && (
                    <TR>
                      <TD colSpan={4} className="py-8 text-center text-text-tertiary">
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
                  {stats.isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TR key={i}>
                          <TD colSpan={2}>
                            <Skeleton className="h-4 w-full" />
                          </TD>
                        </TR>
                      ))
                    : (d?.hardestLabs ?? []).map((l) => (
                        <TR key={l.slug}>
                          <TD className="max-w-48 truncate font-medium">{l.title}</TD>
                          <TD>
                            <div className="flex items-center gap-2.5">
                              <Progress value={l.solveRatePct} className="h-1.5" label={`Solve rate ${Math.round(l.solveRatePct)}%`} />
                              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-text-secondary">
                                {Math.round(l.solveRatePct)}%
                              </span>
                            </div>
                          </TD>
                        </TR>
                      ))}
                  {!stats.isLoading && (d?.hardestLabs.length ?? 0) === 0 && (
                    <TR>
                      <TD colSpan={2} className="py-8 text-center text-text-tertiary">
                        No solve data yet.
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
            </TableCard>
          </div>
        </div>
      )}
    </div>
  );
}
