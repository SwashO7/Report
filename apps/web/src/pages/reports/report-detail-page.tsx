import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, ExternalLink, FileWarning, Lock, RefreshCw } from 'lucide-react';
import type { ReportDetail } from '@suraksha/shared';
import { api, ApiError } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/card';
import { RichText } from '@/features/learning/rich-text';
import { ReportImage, ReportVideo } from '@/features/reports/report-media';

function BackToReports() {
  return (
    <Link
      to="/reports"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
    >
      <ArrowLeft className="size-4" aria-hidden />
      All reports
    </Link>
  );
}

export default function ReportDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.report(slug),
    queryFn: () => api<{ report: ReportDetail }>(`/reports/${encodeURIComponent(slug)}`),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 1,
  });
  const report = data?.report;

  useSeo(report ? `${report.title} | Reports | Suraksha Labs` : 'Report | Suraksha Labs', report?.excerpt);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading report">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-6 h-3.5 w-32" />
        <Skeleton className="mt-4 h-10 w-4/5" />
        <Skeleton className="mt-8 aspect-video w-full rounded-lg" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {notFound ? (
          <EmptyState
            icon={FileWarning}
            title="Report not found"
            description="This report may have been removed or unpublished, or the link is incorrect."
            action={
              <Link to="/reports">
                <Button variant="outline">Browse all reports</Button>
              </Link>
            }
          />
        ) : (
          <ErrorState
            title="Could not load this report"
            description="Something went wrong. Check your connection and try again."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => void refetch()}>
                  <RefreshCw className="size-4" aria-hidden /> Try again
                </Button>
                <Link to="/reports">
                  <Button variant="ghost">Back to reports</Button>
                </Link>
              </div>
            }
          />
        )}
      </div>
    );
  }

  const paragraphs = report.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const wasUpdated =
    report.publishedAt && new Date(report.updatedAt).getTime() - new Date(report.publishedAt).getTime() > 60_000;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
      <BackToReports />

      {report.status !== 'published' && (
        <div role="status" className="mt-5 rounded-lg border border-warning/40 bg-warning-subtle px-4 py-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning">
            <Lock className="size-4" aria-hidden />
            Draft preview - visitors cannot see this report
          </p>
          <Link to="/admin/reports" className="mt-1 inline-block text-xs font-medium text-warning underline-offset-2 hover:underline">
            Publish it from the admin panel
          </Link>
        </div>
      )}

      <article className="mt-6" aria-labelledby="report-title">
        <header>
          <p className="signal-label">Report</p>
          <h1 id="report-title" className="mt-3 text-3xl font-bold tracking-tight text-text [overflow-wrap:anywhere] sm:text-4xl">
            {report.title}
          </h1>
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-text-secondary">
            {report.publishedAt && (
              <div>
                <dt className="sr-only">Published</dt>
                <dd className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-text-tertiary" aria-hidden />
                  <time dateTime={report.publishedAt}>{formatDate(report.publishedAt)}</time>
                </dd>
              </div>
            )}
            {wasUpdated && (
              <div className="inline-flex items-center gap-1.5">
                <dt className="text-text-tertiary">Updated</dt>
                <dd>
                  <time dateTime={report.updatedAt}>{formatDate(report.updatedAt)}</time>
                </dd>
              </div>
            )}
          </dl>
        </header>

        {report.image && (
          <figure className="mt-8">
            <div className="overflow-hidden rounded-lg border border-border bg-surface-2">
              <ReportImage image={report.image} fit="natural" loading="eager" className="mx-auto" />
            </div>
            <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-text-tertiary">
              <span className="min-w-0">{report.image.alt !== report.title ? report.image.alt : ''}</span>
              <a
                href={report.image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-text-secondary transition-colors hover:text-accent"
              >
                Open full-size image <ExternalLink className="size-3" aria-hidden />
              </a>
            </figcaption>
          </figure>
        )}

        {report.video && (
          <figure className="mt-8">
            <div className="overflow-hidden rounded-lg border border-border">
              <ReportVideo video={report.video} title={report.title} />
            </div>
          </figure>
        )}

        <div className="mt-8 max-w-3xl space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-text-secondary [overflow-wrap:anywhere]">
              <RichText text={p} />
            </p>
          ))}
        </div>
      </article>

      <div className="mt-12 border-t border-border pt-6">
        <BackToReports />
      </div>
    </div>
  );
}
