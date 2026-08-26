import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Flag,
  HelpCircle,
  Info,
  OctagonAlert,
  XCircle,
} from 'lucide-react';
import { youtubeEmbedUrl, type ContentBlock } from '@suraksha/shared';
import type { ExercisePublic, LessonDetail } from '@suraksha/shared';
import { Badge, type BadgeVariant } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatXp } from '@/lib/utils';
import { RichText } from './rich-text';
import { ExerciseCard } from './exercise-card';

export interface BlockContext {
  exercises?: ExercisePublic[];
  relatedLabs?: LessonDetail['relatedLabs'];
  pathSlug?: string;
  onExerciseCompleted?: () => void;
}

type QuizBlockData = Extract<ContentBlock, { type: 'quiz' }>;
type HeadingBlockData = Extract<ContentBlock, { type: 'heading' }>;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function difficultyBadgeVariant(difficulty: string): BadgeVariant {
  const d = difficulty.toLowerCase();
  if (d.includes('easy') || d.includes('beginner') || d.includes('intro')) return 'success';
  if (d.includes('medium') || d.includes('intermediate')) return 'warning';
  if (d.includes('hard') || d.includes('advanced') || d.includes('insane') || d.includes('expert')) return 'danger';
  return 'outline';
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}

const PANEL_CLASS = 'my-6 overflow-hidden rounded-lg border border-black/30 bg-[#1b1a17]';
const PANEL_HEADER_CLASS =
  'flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-2';

function Heading({ block }: { block: HeadingBlockData }) {
  const id = slugify(block.text);
  if (block.level === 2) {
    return (
      <h2 id={id} className="mb-3 mt-12 scroll-mt-24 text-2xl font-bold tracking-tight text-text first:mt-0">
        {block.text}
      </h2>
    );
  }
  if (block.level === 3) {
    return (
      <h3 id={id} className="mb-2 mt-9 scroll-mt-24 text-xl font-semibold tracking-tight text-text first:mt-0">
        {block.text}
      </h3>
    );
  }
  return (
    <h4 id={id} className="mb-2 mt-7 scroll-mt-24 text-lg font-semibold tracking-tight text-text first:mt-0">
      {block.text}
    </h4>
  );
}

type VideoBlockData = Extract<ContentBlock, { type: 'video' }>;

function VideoFigure({ block }: { block: VideoBlockData }) {
  const embed = block.provider === 'youtube' ? youtubeEmbedUrl(block.url, block.startAt) : null;
  return (
    <figure className="my-6">
      {embed ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
          <iframe
            src={embed}
            title={block.title ?? 'Lesson video'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <video
          controls
          preload="metadata"
          src={block.url}
          className="aspect-video w-full rounded-lg border border-border bg-black"
        />
      )}
      {block.title && <figcaption className="mt-2 text-center text-sm text-text-tertiary">{block.title}</figcaption>}
    </figure>
  );
}

function ImageFigure({ block }: { block: Extract<ContentBlock, { type: 'image' }> }) {
  return (
    <figure className="my-6">
      <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded-lg border border-border bg-surface-2" />
      {block.caption && <figcaption className="mt-2 text-center text-sm text-text-tertiary">{block.caption}</figcaption>}
    </figure>
  );
}

function CodePanel({ block }: { block: Extract<ContentBlock, { type: 'code' }> }) {
  return (
    <div className={PANEL_CLASS}>
      <div className={PANEL_HEADER_CLASS}>
        <span className="truncate font-mono text-xs text-stone-300">{block.filename ?? 'snippet'}</span>
        <span className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-stone-500">{block.language}</span>
          <CopyButton value={block.code} />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-stone-200">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}

function CommandPanel({ block }: { block: Extract<ContentBlock, { type: 'command' }> }) {
  return (
    <div className="my-6">
      {block.description && (
        <RichText text={block.description} className="mb-2 block text-sm text-text-secondary" />
      )}
      <div className={PANEL_CLASS}>
        <div className={PANEL_HEADER_CLASS}>
          <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">Shell</span>
          <CopyButton value={block.commands.join('\n')} />
        </div>
        <div className="space-y-1.5 overflow-x-auto p-4">
          {block.commands.map((cmd, i) => (
            <p key={i} className="whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed text-stone-100">
              <span className="mr-3 select-none text-stone-600" aria-hidden>
                $
              </span>
              {cmd}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

const CALLOUT_STYLES = {
  info: { box: 'border-l-accent bg-accent-subtle', icon: Info, iconClass: 'text-accent', label: 'text-accent' },
  warning: { box: 'border-l-warning bg-warning-subtle', icon: AlertTriangle, iconClass: 'text-warning', label: 'text-warning' },
  success: { box: 'border-l-success bg-success-subtle', icon: CheckCircle2, iconClass: 'text-success', label: 'text-success' },
  danger: { box: 'border-l-danger bg-danger-subtle', icon: OctagonAlert, iconClass: 'text-danger', label: 'text-danger' },
} as const;

function Callout({ block }: { block: Extract<ContentBlock, { type: 'callout' }> }) {
  const style = CALLOUT_STYLES[block.variant];
  const Icon = style.icon;
  return (
    <aside className={cn('my-6 flex gap-3 rounded-r-xl border border-border border-l-4 p-4', style.box)}>
      <Icon className={cn('mt-0.5 size-4.5 shrink-0', style.iconClass)} aria-hidden />
      <div className="min-w-0">
        {block.title && <p className={cn('text-sm font-semibold', style.label)}>{block.title}</p>}
        <RichText text={block.text} className="mt-0 block text-sm leading-relaxed" />
      </div>
    </aside>
  );
}

function ListPanel({ block }: { block: Extract<ContentBlock, { type: 'list' }> }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={cn(
        'my-6 space-y-1.5 pl-6 text-[15px] leading-relaxed text-text-secondary',
        block.ordered ? 'list-decimal' : 'list-disc',
        'marker:text-text-tertiary',
      )}
    >
      {block.items.map((item, i) => (
        <li key={i}>
          <RichText text={item} />
        </li>
      ))}
    </Tag>
  );
}

function QuizCard({ block }: { block: QuizBlockData }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = checked && selected === block.correctIndex;

  const optionClasses = (i: number) => {
    if (!checked) {
      return selected === i
        ? 'border-accent bg-accent-subtle text-text'
        : 'border-border text-text-secondary hover:border-border-strong hover:bg-surface-2';
    }
    if (i === block.correctIndex) return 'border-success bg-success-subtle text-text';
    if (i === selected) return 'border-danger bg-danger-subtle text-text';
    return 'border-border text-text-secondary opacity-70';
  };

  return (
    <section className="my-6 rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 text-text-tertiary">
        <HelpCircle className="size-4 text-accent" aria-hidden />
        <span className="micro-label text-accent">Knowledge check</span>
      </div>
      <p className="mt-3 text-sm font-medium text-text">{block.question}</p>
      <div role="radiogroup" aria-label={block.question} className="mt-3 space-y-2">
        {block.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            disabled={checked}
            onClick={() => setSelected(i)}
            className={cn(
              'flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors',
              optionClasses(i),
              checked && 'cursor-default',
            )}
          >
            <span
              className={cn(
                'mt-px flex size-5 shrink-0 items-center justify-center rounded-full border border-current/30 text-[11px] font-semibold',
                i === selected && !checked && 'text-accent',
                checked && i === block.correctIndex && 'text-success',
                checked && i === selected && i !== block.correctIndex && 'text-danger',
                checked && i !== selected && i !== block.correctIndex && 'text-text-tertiary',
              )}
              aria-hidden
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span>{opt}</span>
            {checked && i === block.correctIndex && <CheckCircle2 className="ml-auto size-4 shrink-0 text-success" aria-hidden />}
            {checked && i === selected && i !== block.correctIndex && <XCircle className="ml-auto size-4 shrink-0 text-danger" aria-hidden />}
          </button>
        ))}
      </div>

      {checked ? (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div className={cn('rounded-lg px-3.5 py-2.5 text-sm', correct ? 'bg-success-subtle' : 'bg-warning-subtle')}>
            <p className={cn('flex items-center gap-1.5 font-medium', correct ? 'text-success' : 'text-warning')}>
              {correct ? (
                <>
                  <CheckCircle2 className="size-3.5" aria-hidden /> Correct
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" aria-hidden /> Not quite â€” the answer is{' '}
                  {String.fromCharCode(65 + block.correctIndex)}
                </>
              )}
            </p>
            {block.explanation && <RichText text={block.explanation} className="mt-1 block text-text-secondary" />}
          </div>
          {!correct && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setChecked(false);
                setSelected(null);
              }}
            >
              Try again
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-4 border-t border-border pt-4">
          <Button size="sm" disabled={selected === null} onClick={() => setChecked(true)}>
            Check answer
          </Button>
        </div>
      )}
    </section>
  );
}

export function LabRefCard({
  labSlug,
  title,
  related,
  compact = false,
}: {
  labSlug: string;
  title?: string;
  related?: LessonDetail['relatedLabs'][number];
  compact?: boolean;
}) {
  const displayTitle = title ?? related?.title ?? 'Practice lab';
  return (
    <Link
      to={`/labs/${labSlug}`}
      className="group flex items-center gap-3.5 rounded-lg border border-border bg-surface p-4 transition-all hover:border-border-strong hover:shadow-md"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent" aria-hidden>
        <Flag className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-text group-hover:text-accent">{displayTitle}</span>
        {!compact && related?.shortDescription && (
          <span className="mt-0.5 line-clamp-1 block text-xs text-text-tertiary">{related.shortDescription}</span>
        )}
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {related && (
            <>
              <Badge variant="accent">+{formatXp(related.xpReward)} XP</Badge>
              <Badge variant={difficultyBadgeVariant(related.difficulty)}>{related.difficulty}</Badge>
              {related.solved && (
                <Badge variant="success">
                  <CheckCircle2 className="size-3" aria-hidden />
                  Solved
                </Badge>
              )}
            </>
          )}
        </span>
      </span>
      {!compact && (
        <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-surface-3 px-3 py-1.5 text-xs font-medium text-text transition-colors group-hover:bg-accent group-hover:text-accent-foreground sm:inline-flex">
          Open lab
          <ChevronRight className="size-3.5" aria-hidden />
        </span>
      )}
      {compact && <ChevronRight className="size-4 shrink-0 text-text-tertiary" aria-hidden />}
    </Link>
  );
}

function PracticeRef({ block, context }: { block: Extract<ContentBlock, { type: 'practice_ref' }>; context?: BlockContext }) {
  const exercise = context?.exercises?.find((e) => e.slug === block.exerciseSlug);
  if (exercise) {
    return (
      <div className="my-6">
        <ExerciseCard exercise={exercise} onCompleted={context?.onExerciseCompleted} />
      </div>
    );
  }
  return (
    <div className="my-6 flex items-center gap-3.5 rounded-lg border border-dashed border-border-strong bg-surface-2/60 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-tertiary" aria-hidden>
        <BookOpenCheck className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-text">{block.title}</span>
        <span className="block text-xs text-text-tertiary">Practice exercise â€” part of this lesson</span>
      </span>
    </div>
  );
}

function ResourceRow({ block }: { block: Extract<ContentBlock, { type: 'resource' }> }) {
  const external = block.kind === 'external';
  const Icon = external ? ExternalLink : Download;
  return (
    <a
      href={block.url}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : { download: true })}
      className="group my-6 flex items-center gap-3.5 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-2"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-secondary group-hover:text-accent" aria-hidden>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-text">{block.label}</span>
        {block.description && <span className="block truncate text-xs text-text-tertiary">{block.description}</span>}
      </span>
      <ArrowRight className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
    </a>
  );
}

function RelatedLessonRow({ block, context }: { block: Extract<ContentBlock, { type: 'related_lesson' }>; context?: BlockContext }) {
  const href = context?.pathSlug ? `/learn/${context.pathSlug}/${block.lessonSlug}` : undefined;
  const inner = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-text-secondary group-hover:text-accent" aria-hidden>
        <BookOpen className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
        {block.title ?? 'Related lesson'}
      </span>
      <ArrowRight className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
    </>
  );
  const classes =
    'group my-6 flex items-center gap-3.5 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-2';
  if (!href) return <div className={classes}>{inner}</div>;
  return (
    <Link to={href} className={classes}>
      {inner}
    </Link>
  );
}

export function ContentBlockRenderer({ block, context }: { block: ContentBlock; context?: BlockContext }) {
  switch (block.type) {
    case 'heading':
      return <Heading block={block} />;
    case 'paragraph':
      return (
        <RichText
          text={block.text}
          className="my-5 block text-[15px] leading-7 text-text-secondary first:mt-0 last:mb-0"
        />
      );
    case 'video':
      return <VideoFigure block={block} />;
    case 'image':
      return <ImageFigure block={block} />;
    case 'code':
      return <CodePanel block={block} />;
    case 'command':
      return <CommandPanel block={block} />;
    case 'callout':
      return <Callout block={block} />;
    case 'list':
      return <ListPanel block={block} />;
    case 'quiz':
      return <QuizCard block={block} />;
    case 'practice_ref':
      return <PracticeRef block={block} context={context} />;
    case 'lab_ref':
    case 'related_lab': {
      const related = context?.relatedLabs?.find((l) => l.slug === block.labSlug);
      return (
        <div className="my-6">
          <LabRefCard labSlug={block.labSlug} title={block.title} related={related} />
        </div>
      );
    }
    case 'resource':
      return <ResourceRow block={block} />;
    case 'related_lesson':
      return <RelatedLessonRow block={block} context={context} />;
    default:
      return null;
  }
}
