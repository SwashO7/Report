import { z } from 'zod';
import { contentBlockSchema } from './content';

/** ---------- Learning ---------- */

export const lessonSaveSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  summary: z.string().max(1000).optional(),
  estimatedMinutes: z.number().int().min(1).max(600).optional(),
  blocks: z.array(contentBlockSchema).max(200).optional(),
  changeNote: z.string().max(500).optional(),
});

export const lessonCreateSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only'),
  summary: z.string().max(1000).default(''),
  estimatedMinutes: z.number().int().min(1).max(600).default(10),
  blocks: z.array(contentBlockSchema).max(200).default([]),
});
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonSaveInput = z.infer<typeof lessonSaveSchema>;

export const moduleCreateSchema = z.object({
  pathId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).default(''),
});
export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;

export const exerciseUpsertSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  lessonId: z.string().uuid(),
  title: z.string().trim().min(2).max(300),
  instructions: z.string().max(5000).default(''),
  kind: z.enum(['quiz']),
  questions: z
    .array(
      z.object({
        prompt: z.string().min(1).max(2000),
        options: z.array(z.string().min(1).max(1000)).min(2).max(10),
        correctIndex: z.number().int().min(0).max(9),
        explanation: z.string().max(3000).optional(),
      }),
    )
    .min(1)
    .max(30),
  xpReward: z.number().int().min(0).max(10000),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const exerciseSubmitSchema = z.object({
  answers: z.array(z.object({ questionIndex: z.number().int().min(0), choiceIndex: z.number().int().min(0) })).max(50),
});

/** ---------- Labs ---------- */

export const hintSchema = z.object({
  content: z.string().min(1).max(3000),
});

export const labCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().max(300),
  description: z.string().max(20000).default(''),
  categoryId: z.string().uuid(),
  difficultyId: z.string().uuid(),
  estimatedMinutes: z.number().int().min(5).max(1440).default(30),
  xpReward: z.number().int().min(0).max(100000).default(250),
  objectives: z.array(z.string().min(1).max(500)).max(20).default([]),
  setupInstructions: z.string().max(20000).default(''),
  skills: z.array(z.string().min(1).max(80)).max(20).default([]),
  hints: z.array(hintSchema).max(8).default([]),
  flagHash: z.string().min(32).max(128),
  flagCaseSensitive: z.boolean().default(true),
  prerequisiteLabIds: z.array(z.string().uuid()).max(10).default([]),
  relatedLessonIds: z.array(z.string().uuid()).max(10).default([]),
  visibility: z.enum(['public', 'unlisted']).default('public'),
});

export const labUpdateSchema = labCreateSchema.partial().extend({
  reviewerNotes: z.string().max(5000).optional(),
});

export const flagSubmitSchema = z.object({ flag: z.string().trim().min(1).max(500) });

export const labQuerySchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(120).optional(),
  difficulty: z.string().max(120).optional(),
  skill: z.string().max(120).optional(),
  maxMinutes: z.coerce.number().int().min(5).max(1440).optional(),
  status: z.enum(['all', 'solved', 'unsolved', 'in_progress']).default('all'),
  sort: z.enum(['newest', 'popular', 'xp', 'difficulty']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(24),
});

/** ---------- Leaderboard / profile ---------- */

export const leaderboardQuerySchema = z.object({
  category: z.string().max(120).optional(),
  season: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(25),
});

/** ---------- Admin users ---------- */

export const adminUserQuerySchema = z.object({
  q: z.string().max(200).optional(),
  role: z.string().max(40).optional(),
  status: z.string().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(25),
  sort: z.enum(['newest', 'xp', 'name']).default('newest'),
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(['learner', 'content_editor', 'lab_manager', 'moderator', 'administrator', 'super_admin']).optional(),
  status: z.enum(['active', 'suspended', 'deleted']).optional(),
  emailVerified: z.boolean().optional(),
});

export const xpAdjustSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().min(-100000).max(100000),
  reason: z.string().min(3).max(500),
});

/** Pagination envelope */
export const paginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type Pagination = z.infer<typeof paginationSchema>;
