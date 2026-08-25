import {
  Award,
  BookOpen,
  Bug,
  Crown,
  EyeOff,
  Flag,
  Flame,
  Gem,
  GraduationCap,
  Medal,
  Network,
  Pencil,
  Search,
  Shield,
  Target,
  Terminal,
  Timer,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn, RARITY_STYLES } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  award: Award,
  'book-open': BookOpen,
  bug: Bug,
  crown: Crown,
  'eye-off': EyeOff,
  flag: Flag,
  flame: Flame,
  gem: Gem,
  'graduation-cap': GraduationCap,
  medal: Medal,
  network: Network,
  pencil: Pencil,
  search: Search,
  shield: Shield,
  target: Target,
  terminal: Terminal,
  timer: Timer,
  trophy: Trophy,
  zap: Zap,
};

export function resolveAchievementIcon(icon: string): LucideIcon {
  return ICONS[icon] ?? Award;
}

type MedallionSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<MedallionSize, { box: string; icon: string }> = {
  xs: { box: 'size-8', icon: 'size-4' },
  sm: { box: 'size-10', icon: 'size-4.5' },
  md: { box: 'size-12', icon: 'size-5.5' },
  lg: { box: 'size-16', icon: 'size-7' },
  xl: { box: 'size-20', icon: 'size-9' },
};

/**
 * Achievement medallion — lucide icon inside a rarity-tinted ring.
 * Pass `locked` to render the muted variant (color drains via opacity).
 */
export function AchievementMedallion({
  icon,
  rarity,
  size = 'md',
  locked = false,
  className,
}: {
  icon: string;
  rarity: string;
  size?: MedallionSize;
  locked?: boolean;
  className?: string;
}) {
  const Icon = resolveAchievementIcon(icon);
  const rarityStyle = RARITY_STYLES[rarity] ?? RARITY_STYLES.common;
  const sizes = SIZE_CLASSES[size];

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border bg-surface shadow-xs',
        sizes.box,
        rarityStyle.className,
        locked && 'border-border bg-surface-2 text-text-tertiary opacity-70',
        className,
      )}
    >
      <Icon className={sizes.icon} />
    </span>
  );
}
