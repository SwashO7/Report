import type { ContentBlock } from '@suraksha/shared';

/**
 * Curriculum seed types.
 *
 * Shape: path -> module -> lesson -> content blocks, plus standalone practice
 * exercises that attach to a lesson by slug. Every lesson in the seed is
 * published by the seeder, so anything added here goes live on `bun run db:seed`.
 */

/** 'core' = must-know, badged "Must know". 'optional' = skippable side quest. */
export type LessonImportance = 'essential' | 'core' | 'optional';

export type LessonSeed = {
  /** Globally unique across the whole platform (lessons.slug is unique). */
  slug: string;
  title: string;
  /** One punchy line shown on cards and lesson headers. Keep under 160 chars. */
  summary: string;
  estimatedMinutes: number;
  importance: LessonImportance;
  blocks: ContentBlock[];
};

export type ModuleSeed = {
  /** Unique within its path. */
  slug: string;
  title: string;
  description: string;
  lessons: LessonSeed[];
};

export type PathSeed = {
  slug: string;
  name: string;
  levelNumber: number;
  icon: string;
  sortOrder: number;
  description: string;
  modules: ModuleSeed[];
};

export type ExerciseQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type ExerciseSeed = {
  /** Must match a LessonSeed.slug somewhere in the curriculum. */
  lessonSlug: string;
  /** Globally unique. Convention: `<module-or-topic>-quiz`. */
  slug: string;
  title: string;
  instructions: string;
  kind: 'quiz';
  xpReward: number;
  questions: ExerciseQuestion[];
};

/**
 * Sentinel URL for a reserved video slot. The web renderer detects this host
 * and draws a "Video dropping soon" placeholder instead of a broken player.
 * Replace the URL in Admin -> Lessons once the real video is published.
 */
export const VIDEO_SOON = 'https://video.suraksha.local/coming-soon';

/** Reserves the lesson's video slot and records the video that should go there. */
export function videoSlot(plannedTitle: string): ContentBlock {
  return { type: 'video', provider: 'youtube', url: VIDEO_SOON, title: plannedTitle };
}
