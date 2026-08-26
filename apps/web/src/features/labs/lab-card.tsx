import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, CircleDashed, Clock, PlayCircle } from 'lucide-react';
import { cn, formatMinutes, formatXp } from '@/lib/utils';
import { DifficultyDot } from '@/components/ui/card';
import type { LabCard } from '@suraksha/shared';

/**
 * Catalog row — the system's primary lab surface.
 * Fixed column grid keeps every row perfectly aligned at any density,
 * in the spirit of a well-set index page rather than a card wall.
 */

const GRID =
  'grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 md:grid-cols-[2rem_minmax(0,1fr)_9.5rem_5rem_7rem_1.75rem]';

export function LabRow({ lab }: { lab: LabCard }) {
  const StatusIcon = lab.solved ? CheckCircle2 : lab.inProgress ? PlayCircle : CircleDashed;
  return (
    <Link to={`/labs/${lab.slug}`} className="group block" aria-label={`Open lab: ${lab.title}`}>
      <article
        className={cn(
          GRID,
          'gap-y-0.5 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 sm:px-5 group-hover:bg-surface-2',
        )}
      >
        <span aria-hidden className="flex justify-center">
          <StatusIcon
            className={cn(
              'size-[18px]',
              lab.solved ? 'text-success' : lab.inProgress ? 'text-accent' : 'text-text-tertiary/50',
            )}
          />
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
            {lab.title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-text-tertiary">{lab.shortDescription}</span>
        </span>

        <span className="hidden truncate text-xs text-text-secondary md:block" title={lab.category.name}>
          {lab.category.name}
        </span>

        <span className="hidden md:block">
          <DifficultyDot orderIndex={lab.difficulty.orderIndex} label={lab.difficulty.label} />
        </span>

        <span className="hidden text-right md:block">
          <span className="block text-sm font-medium tabular-nums text-text">+{formatXp(lab.xpReward)}</span>
          <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-text-tertiary">
            <Clock className="size-3" aria-hidden />
            {formatMinutes(lab.estimatedMinutes)}
          </span>
        </span>

        <span aria-hidden className="hidden justify-end text-text-tertiary transition-colors group-hover:text-accent md:flex">
          <ChevronRight className="size-4" />
        </span>

        {/* Mobile meta line */}
        <span className="col-start-2 flex items-center gap-3 md:hidden">
          <DifficultyDot orderIndex={lab.difficulty.orderIndex} label={lab.difficulty.label} />
          <span className="text-xs font-medium tabular-nums text-accent">+{formatXp(lab.xpReward)} XP</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-text-tertiary">
            {formatMinutes(lab.estimatedMinutes)}
          </span>
        </span>
      </article>
    </Link>
  );
}

/** Bordered container for a stack of lab rows. */
export function LabRowList({ labs, children }: { labs?: LabCard[]; children?: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {/* Column header — mirrors the grid so titles align with data below */}
      <div
        className={cn(
          GRID,
          'hidden border-b border-border bg-surface px-4 py-2 sm:px-5 md:grid',
        )}
        aria-hidden
      >
        <span />
        <span className="micro-label">Challenge</span>
        <span className="micro-label">Category</span>
        <span className="micro-label">Difficulty</span>
        <span className="micro-label text-right">Reward</span>
        <span />
      </div>
      <div>{labs ? labs.map((lab) => <LabRow key={lab.id} lab={lab} />) : children}</div>
    </div>
  );
}
