import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Image as ImageIcon, PlayCircle } from 'lucide-react';
import type { ReportCard as ReportCardType } from '@suraksha/shared';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/card';
import { ReportImage, ReportVideo } from './report-media';

/**
 * One entry in the public report feed.
 *
 * Text leads (date → title → preview → action); media sits beside it from `md`
 * up and drops below it on small screens. A report without media simply spans
 * the full width, so there is never an empty frame.
 *
 * The card is deliberately NOT one big link: an attached video needs its own
 * controls, and a wrapping anchor would hijack every click on them.
 */
export function ReportCard({ report }: { report: ReportCardType }) {
  const href = `/reports/${report.slug}`;
  const hasMedia = Boolean(report.image || report.video);
  // One attachment sits beside the text; two sit side by side beneath it, so the
  // text column is never stretched to the height of two stacked frames.
  const hasBoth = Boolean(report.image && report.video);

  return (
    <article
      className={cn(
        'surface-panel grid gap-5 p-5 hover:border-border-strong sm:p-6',
        hasMedia && !hasBoth && 'md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-8',
      )}
      aria-labelledby={`report-${report.id}-title`}
    >
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {report.publishedAt && (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-tertiary">
              <CalendarDays className="size-3.5" aria-hidden />
              <time dateTime={report.publishedAt}>{formatDate(report.publishedAt)}</time>
            </span>
          )}
          {report.image && (
            <Badge variant="outline">
              <ImageIcon className="size-3" aria-hidden /> Image
            </Badge>
          )}
          {report.video && (
            <Badge variant="outline">
              <PlayCircle className="size-3" aria-hidden /> Video
            </Badge>
          )}
        </div>

        <h2 id={`report-${report.id}-title`} className="mt-3 text-xl font-semibold leading-snug tracking-tight text-text sm:text-2xl">
          <Link to={href} className="transition-colors hover:text-accent">
            {report.title}
          </Link>
        </h2>

        {report.excerpt && <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">{report.excerpt}</p>}

        <div className="mt-5 pt-1 md:mt-auto">
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            aria-label={`Read report: ${report.title}`}
          >
            Read report <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {hasMedia && (
        <div className={cn('grid min-w-0 content-start gap-3', hasBoth && 'sm:grid-cols-2')}>
          {report.image && (
            <Link to={href} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-lg border border-border">
              <ReportImage image={report.image} className="transition-transform duration-300 hover:scale-[1.02]" />
            </Link>
          )}
          {report.video && (
            <div className="overflow-hidden rounded-lg border border-border">
              <ReportVideo video={report.video} title={report.title} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
