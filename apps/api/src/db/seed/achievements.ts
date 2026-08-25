export type AchievementCriteria = {
  event: string;
  metric: string;
  threshold: number;
  categorySlug?: string;
  maxHints?: number;
  withinMinutes?: number;
};

export type AchievementSeed = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: AchievementCriteria;
  xpReward: number;
};

export const ACHIEVEMENT_SEEDS: AchievementSeed[] = [
  {
    slug: 'first-lab',
    title: 'First Flag',
    description: 'Solve your first lab. Every specialist started exactly here.',
    icon: 'flag',
    category: 'labs',
    rarity: 'common',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 1 },
    xpReward: 50,
  },
  {
    slug: 'first-blood',
    title: 'First Blood',
    description: 'Solve a lab within 15 minutes without using any hints.',
    icon: 'zap',
    category: 'labs',
    rarity: 'rare',
    criteria: { event: 'lab_solved', metric: 'speed_solve', threshold: 1, withinMinutes: 15, maxHints: 0 },
    xpReward: 100,
  },
  {
    slug: 'linux-initiated',
    title: 'Terminal Initiate',
    description: 'Solve a Linux-category lab.',
    icon: 'terminal',
    category: 'labs',
    rarity: 'uncommon',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 1, categorySlug: 'linux' },
    xpReward: 50,
  },
  {
    slug: 'network-navigator',
    title: 'Network Navigator',
    description: 'Solve a Networking-category lab.',
    icon: 'network',
    category: 'labs',
    rarity: 'uncommon',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 1, categorySlug: 'networking' },
    xpReward: 50,
  },
  {
    slug: 'web-hunter',
    title: 'Web Hunter',
    description: 'Solve a Web Security-category lab.',
    icon: 'globe',
    category: 'labs',
    rarity: 'uncommon',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 1, categorySlug: 'web-security' },
    xpReward: 50,
  },
  {
    slug: 'recon-specialist',
    title: 'Recon Specialist',
    description: 'Solve a Reconnaissance-category lab.',
    icon: 'search',
    category: 'labs',
    rarity: 'rare',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 1, categorySlug: 'recon' },
    xpReward: 75,
  },
  {
    slug: 'first-attempt',
    title: 'One Shot',
    description: 'Solve a lab on your very first attempt with zero hints.',
    icon: 'target',
    category: 'labs',
    rarity: 'rare',
    criteria: { event: 'lab_solved', metric: 'first_attempt_solve', threshold: 1, maxHints: 0 },
    xpReward: 100,
  },
  {
    slug: 'no-hint-solve',
    title: 'Unassisted',
    description: 'Solve any lab without revealing a single hint.',
    icon: 'eye-off',
    category: 'labs',
    rarity: 'uncommon',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 1, maxHints: 0 },
    xpReward: 50,
  },
  {
    slug: 'speed-solver',
    title: 'Speedrunner',
    description: 'Solve a lab in under 5 minutes.',
    icon: 'timer',
    category: 'labs',
    rarity: 'epic',
    criteria: { event: 'lab_solved', metric: 'speed_solve', threshold: 1, withinMinutes: 5 },
    xpReward: 150,
  },
  {
    slug: 'ten-labs',
    title: 'Medalist',
    description: 'Solve 10 labs.',
    icon: 'medal',
    category: 'mastery',
    rarity: 'rare',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 10 },
    xpReward: 200,
  },
  {
    slug: 'twenty-five-labs',
    title: 'Trophy Hunter',
    description: 'Solve 25 labs.',
    icon: 'trophy',
    category: 'mastery',
    rarity: 'epic',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 25 },
    xpReward: 400,
  },
  {
    slug: 'fifty-labs',
    title: 'Crown Bearer',
    description: 'Solve 50 labs.',
    icon: 'crown',
    category: 'mastery',
    rarity: 'legendary',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 50 },
    xpReward: 800,
  },
  {
    slug: 'hundred-labs',
    title: 'Centurion',
    description: 'Solve 100 labs. The platform salutes you.',
    icon: 'gem',
    category: 'mastery',
    rarity: 'legendary',
    criteria: { event: 'lab_solved', metric: 'count', threshold: 100 },
    xpReward: 1500,
  },
  {
    slug: 'scholar',
    title: 'Scholar',
    description: 'Complete 5 lessons across any path.',
    icon: 'book-open',
    category: 'learning',
    rarity: 'uncommon',
    criteria: { event: 'lesson_completed', metric: 'count', threshold: 5 },
    xpReward: 75,
  },
  {
    slug: 'dedicated',
    title: 'Dedicated',
    description: 'Complete 15 lessons. Consistency is a skill too.',
    icon: 'graduation-cap',
    category: 'learning',
    rarity: 'rare',
    criteria: { event: 'lesson_completed', metric: 'count', threshold: 15 },
    xpReward: 150,
  },
  {
    slug: 'streak-3',
    title: 'On Fire',
    description: 'Maintain a 3-day learning streak.',
    icon: 'flame',
    category: 'engagement',
    rarity: 'uncommon',
    criteria: { event: 'streak_day', metric: 'count', threshold: 3 },
    xpReward: 50,
  },
  {
    slug: 'streak-7',
    title: 'Week Streak',
    description: 'Maintain a 7-day learning streak.',
    icon: 'flame',
    category: 'engagement',
    rarity: 'rare',
    criteria: { event: 'streak_day', metric: 'count', threshold: 7 },
    xpReward: 100,
  },
  {
    slug: 'practice-starter',
    title: 'Practice Makes Perfect',
    description: 'Complete 3 practice exercises.',
    icon: 'pencil',
    category: 'learning',
    rarity: 'common',
    criteria: { event: 'practice_completed', metric: 'count', threshold: 3 },
    xpReward: 25,
  },
];
