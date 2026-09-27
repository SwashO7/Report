import { useState } from 'react';
import { ImageOff, VideoOff } from 'lucide-react';
import type { ReportMedia } from '@suraksha/shared';
import { cn } from '@/lib/utils';

/**
 * Media primitives shared by the public report feed, the report page and the
 * admin editor preview. Both degrade to a quiet placeholder when the file fails
 * to load, so a missing object never leaves a broken-image glyph on the page.
 */

function MediaUnavailable({ kind, className }: { kind: 'image' | 'video'; className?: string }) {
  const Icon = kind === 'image' ? ImageOff : VideoOff;
  return (
    <div
      role="img"
      aria-label={kind === 'image' ? 'Image unavailable' : 'Video unavailable'}
      className={cn('flex aspect-video w-full flex-col items-center justify-center gap-2 bg-surface-2 text-text-tertiary', className)}
    >
      <Icon className="size-5" aria-hidden />
      <span className="text-xs">{kind === 'image' ? 'Image unavailable' : 'Video unavailable'}</span>
    </div>
  );
}

export function ReportImage({
  image,
  fit = 'cover',
  className,
  loading = 'lazy',
}: {
  image: ReportMedia & { alt: string };
  /** `cover` crops into a fixed frame (cards); `natural` shows the whole image at its own ratio. */
  fit?: 'cover' | 'natural';
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <MediaUnavailable kind="image" className={className} />;
  return (
    <img
      src={image.url}
      alt={image.alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        'block w-full bg-surface-2',
        fit === 'cover' ? 'aspect-video object-cover' : 'h-auto max-h-[80vh] object-contain',
        className,
      )}
    />
  );
}

export function ReportVideo({ video, title, className }: { video: ReportMedia; title: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <MediaUnavailable kind="video" className={className} />;
  return (
    <video
      controls
      playsInline
      preload="metadata"
      aria-label={`Video: ${title}`}
      onError={() => setFailed(true)}
      className={cn('block aspect-video w-full bg-black', className)}
    >
      <source src={video.url} type={video.mimeType} onError={() => setFailed(true)} />
      Your browser cannot play this video.
    </video>
  );
}
