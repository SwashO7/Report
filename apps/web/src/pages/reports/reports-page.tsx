import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, FileWarning, ShieldAlert } from 'lucide-react';
import type { Pagination, ReportCard as ReportCardType } from '@suraksha/shared';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { ReportCard } from '@/features/reports/report-card';

interface ReportsResponse {
  reports: ReportCardType[];
  pagination: Pagination;
}

const PAGE_SIZE = 10;

function FeedSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading reports">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="surface-panel grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_18rem] lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-3">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);

  useSeo(
    'Bug and vulnerability reports | Suraksha Labs',
    'Public reports on bugs, vulnerabilities and incidents found in applications, websites and services, documented by the Shadow Security team.',
  );

  const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) }).toString();
  const reportsQ = useQuery({
    queryKey: qk.reports(qs),
    queryFn: () => api<ReportsResponse>(`/reports?${qs}`),
    placeholderData: (previous) => previous,
  });

  const reports = reportsQ.data?.reports ?? [];
  const pagination = reportsQ.data?.pagination;

  const goTo = (next: number) => {
    const p = new URLSearchParams(params);
    if (next <= 1) p.delete('page');
    else p.set('page', String(next));
    setParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <header>
        <p className="signal-label">
          <ShieldAlert className="size-3.5" aria-hidden /> Findings and incidents
        </p>
        <h1 className="page-title mt-4">Reports</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
          Bugs, vulnerabilities and other issues found in products, applications, websites and services, written up so
          anyone can understand what happened.
        </p>
      </header>

      <div className="mt-8 flex items-center justify-between">
        <p className="signal-label">Latest reports</p>
        {pagination && pagination.total > 0 && (
          <span className="font-mono text-xs text-text-tertiary">
            {pagination.total} report{pagination.total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <section className="mt-4" aria-label="Reports">
        {reportsQ.isLoading ? (
          <FeedSkeleton />
        ) : reportsQ.isError ? (
          <ErrorState
            title="Reports did not load"
            description="Check your connection, then try again."
            action={
              <Button variant="outline" onClick={() => void reportsQ.refetch()}>
                Try again
              </Button>
            }
          />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileWarning}
            title="No reports available yet."
            description={page > 1 ? 'There are no reports on this page.' : 'Published reports will appear here.'}
            action={
              page > 1 ? (
                <Button variant="outline" onClick={() => goTo(1)}>
                  Back to the first page
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>

      {pagination && pagination.totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Report pages">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </Button>
          <span className="font-mono text-xs text-text-tertiary">
            {page} / {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => goTo(page + 1)}>
            Next
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </nav>
      )}
    </div>
  );
}
