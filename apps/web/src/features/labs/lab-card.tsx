import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, PlayCircle, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/card';
import { cn, formatMinutes, formatXp } from '@/lib/utils';
import type { BadgeVariant } from '@/components/ui/card';
import type { LabCard } from '@suraksha/shared';

/* ----------------------------- DifficultyBadge ---------------------------- */

const DIFFICULTY_VARIANTS: BadgeVariant[] = ['success', 'accent', 'warning', 'danger'];

/** Difficulty tier badge — beginner=success, intermediate=accent, advanced=warning, expert=danger. */
export function DifficultyBadge({ label, orderIndex }: { label: string; orderIndex: number }) {
  const clamped = Math.min(Math.max(Math.round(orderIndex), 0), DIFFICULTY_VARIANTS.length - 1);
  return <Badge variant={DIFFICULTY_VARIANTS[clamped]}>{label}</Badge>;
}

/* -------------------------------- LabCardView ------------------------------ */

/** Shared lab card used on the landing page and the labs catalog. */
export function LabCardView({ lab }: { lab: LabCard }) {
  return (
    <Link to={`/labs/${lab.slug}`} className="group block h-full" aria-label={`Open lab: ${lab.title}`}>
      <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:border-border-strong group-hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {lab.category.name}
          </span>
          {lab.solved ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2 className="size-4" aria-hidden />
              Solved
            </span>
          ) : lab.inProgress ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent">
              <PlayCircle className="size-4" aria-hidden />
              In progress
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight text-text">{lab.title}</h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-text-secondary">{lab.shortDescription}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3.5 text-xs text-text-secondary">
          <DifficultyBadge label={lab.difficulty.label} orderIndex={lab.difficulty.orderIndex} />
          <span className={cn('inline-flex items-center gap-1 font-medium text-accent')}>
            <Zap className="size-3.5" aria-hidden />+{formatXp(lab.xpReward)} XP
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5 text-text-tertiary" aria-hidden />
            {formatMinutes(lab.estimatedMinutes)}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-text-tertiary">
            <Users className="size-3.5" aria-hidden />
            {formatXp(lab.solvedByCount)}
          </span>
        </div>
      </article>
    </Link>
  );
}
