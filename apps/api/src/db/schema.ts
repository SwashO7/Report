import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  serial,
  date,
  bigint,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/* ============================== Users & Auth ============================== */

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    username: varchar('username', { length: 32 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    passwordHash: text('password_hash'),
    authProvider: varchar('auth_provider', { length: 20 }).notNull().default('email'),
    googleId: varchar('google_id', { length: 255 }),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    role: varchar('role', { length: 20 }).notNull().default('learner'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    xp: integer('xp').notNull().default(0),
    levelOrder: integer('level_order').notNull().default(0),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
    experienceLevel: varchar('experience_level', { length: 20 }),
    interests: jsonb('interests').$type<string[]>().notNull().default([]),
    profileVisibility: varchar('profile_visibility', { length: 10 }).notNull().default('public'),
    lastActiveDate: date('last_active_date'),
    streakCount: integer('streak_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('users_email_uq').on(t.email),
    uniqueIndex('users_username_uq').on(t.username),
    index('users_xp_idx').on(t.xp),
    index('users_role_idx').on(t.role),
    index('users_google_idx').on(t.googleId),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 128 }).notNull(),
    userAgent: varchar('user_agent', { length: 300 }),
    ipHash: varchar('ip_hash', { length: 64 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('sessions_token_uq').on(t.tokenHash), index('sessions_user_idx').on(t.userId)],
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 30 }).notNull(), // email_verify | password_reset
    tokenHash: varchar('token_hash', { length: 128 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('verification_tokens_hash_uq').on(t.tokenHash), index('verification_tokens_user_idx').on(t.userId)],
);

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 40 }).notNull(),
    providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('oauth_provider_uq').on(t.provider, t.providerUserId), index('oauth_user_idx').on(t.userId)],
);

/* ============================ Gamification config ========================= */

export const levels = pgTable(
  'levels',
  {
    id: serial('id').primaryKey(),
    order: integer('order').notNull(),
    name: varchar('name', { length: 80 }).notNull(),
    title: varchar('title', { length: 120 }).notNull(),
    xpThreshold: integer('xp_threshold').notNull(),
    description: text('description').notNull().default(''),
  },
  (t) => [uniqueIndex('levels_order_uq').on(t.order)],
);

export const labCategories = pgTable(
  'lab_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 80 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [uniqueIndex('lab_categories_slug_uq').on(t.slug)],
);

export const difficultyLevels = pgTable(
  'difficulty_levels',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 60 }).notNull(),
    label: varchar('label', { length: 80 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [uniqueIndex('difficulty_levels_slug_uq').on(t.slug)],
);

export const achievements = pgTable(
  'achievements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description').notNull(),
    icon: varchar('icon', { length: 60 }).notNull().default('award'),
    category: varchar('category', { length: 60 }).notNull().default('general'),
    rarity: varchar('rarity', { length: 20 }).notNull().default('common'),
    /** criteria: { event, metric, threshold, categorySlug? , maxHints?, withinDays? } */
    criteria: jsonb('criteria').$type<{
      event: string;
      metric: string;
      threshold: number;
      categorySlug?: string;
      maxHints?: number;
      withinMinutes?: number;
    }>().notNull(),
    xpReward: integer('xp_reward').notNull().default(0),
    isVisible: boolean('is_visible').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('achievements_slug_uq').on(t.slug), index('achievements_event_idx').on(t.category)],
);

export const userAchievements = pgTable(
  'user_achievements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementId: uuid('achievement_id')
      .notNull()
      .references(() => achievements.id, { onDelete: 'cascade' }),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
    shareSlug: varchar('share_slug', { length: 24 }),
    meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [
    uniqueIndex('user_achievements_uq').on(t.userId, t.achievementId),
    uniqueIndex('user_achievements_share_uq').on(t.shareSlug),
    index('user_achievements_user_idx').on(t.userId),
  ],
);

export const seasons = pgTable(
  'seasons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    isActive: boolean('is_active').notNull().default(false),
    rewards: jsonb('rewards').$type<{ description: string; placements?: number[] }>(),
    featuredLabIds: jsonb('featured_lab_ids').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('seasons_active_idx').on(t.isActive), index('seasons_window_idx').on(t.startsAt, t.endsAt)],
);

/* =============================== Learning ================================= */

export const learningPaths = pgTable(
  'learning_paths',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    levelNumber: integer('level_number').notNull().default(0),
    description: text('description').notNull().default(''),
    icon: varchar('icon', { length: 60 }).notNull().default('book-open'),
    published: boolean('published').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('learning_paths_slug_uq').on(t.slug), index('learning_paths_order_idx').on(t.sortOrder)],
);

export const modules = pgTable(
  'modules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    pathId: uuid('path_id')
      .notNull()
      .references(() => learningPaths.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 140 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull().default(''),
    published: boolean('published').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('modules_path_idx').on(t.pathId), uniqueIndex('modules_path_slug_uq').on(t.pathId, t.slug)],
);

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 160 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    summary: varchar('summary', { length: 1000 }).notNull().default(''),
    estimatedMinutes: integer('estimated_minutes').notNull().default(10),
    blocks: jsonb('blocks').$type<unknown[]>().notNull().default([]),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    version: integer('version').notNull().default(1),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    sortOrder: integer('sort_order').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    completionCount: integer('completion_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('lessons_slug_uq').on(t.slug),
    index('lessons_module_idx').on(t.moduleId),
    index('lessons_status_idx').on(t.status),
    index('lessons_order_idx').on(t.moduleId, t.sortOrder),
  ],
);

export const lessonVersions = pgTable(
  'lesson_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    summary: varchar('summary', { length: 1000 }).notNull().default(''),
    blocks: jsonb('blocks').$type<unknown[]>().notNull().default([]),
    changeNote: varchar('change_note', { length: 500 }),
    changedById: uuid('changed_by_id').references(() => users.id, { onDelete: 'set null' }),
    changedByName: varchar('changed_by_name', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('lesson_versions_lesson_idx').on(t.lessonId, t.version)],
);

export const practiceExercises = pgTable(
  'practice_exercises',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 160 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    instructions: text('instructions').notNull().default(''),
    kind: varchar('kind', { length: 30 }).notNull().default('quiz'),
    questions: jsonb('questions')
      .$type<{ prompt: string; options: string[]; correctIndex: number; explanation?: string }[]>()
      .notNull()
      .default([]),
    xpReward: integer('xp_reward').notNull().default(25),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('practice_exercises_slug_uq').on(t.slug), index('practice_exercises_lesson_idx').on(t.lessonId)],
);

export const practiceCompletions = pgTable(
  'practice_completions',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => practiceExercises.id, { onDelete: 'cascade' }),
    scorePct: integer('score_pct').notNull().default(100),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.exerciseId] }), index('practice_completions_user_idx').on(t.userId)],
);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    lastBlockIndex: integer('last_block_index').notNull().default(0),
  },
  (t) => [
    uniqueIndex('lesson_progress_uq').on(t.userId, t.lessonId),
    index('lesson_progress_user_idx').on(t.userId),
    index('lesson_progress_lesson_idx').on(t.lessonId),
  ],
);

export const lessonViews = pgTable(
  'lesson_views',
  {
    id: bigint('id', { mode: 'number' }).generatedByDefaultAsIdentity().primaryKey(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    viewedAt: timestamp('viewed_at', { withTimezone: true }).notNull().defaultNow(),
    day: date('day').notNull(),
  },
  (t) => [index('lesson_views_lesson_idx').on(t.lessonId), index('lesson_views_day_idx').on(t.day)],
);

/* ================================= Labs =================================== */

export const labs = pgTable(
  'labs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 160 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    shortDescription: varchar('short_description', { length: 400 }).notNull().default(''),
    description: text('description').notNull().default(''),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => labCategories.id),
    difficultyId: uuid('difficulty_id')
      .notNull()
      .references(() => difficultyLevels.id),
    estimatedMinutes: integer('estimated_minutes').notNull().default(30),
    xpReward: integer('xp_reward').notNull().default(250),
    objectives: jsonb('objectives').$type<string[]>().notNull().default([]),
    skills: jsonb('skills').$type<string[]>().notNull().default([]),
    hints: jsonb('hints').$type<{ content: string }[]>().notNull().default([]),
    setupInstructions: text('setup_instructions').notNull().default(''),
    /** HMAC-SHA256 of the flag — plaintext flag never stored server-side. */
    flagHmac: varchar('flag_hmac', { length: 128 }).notNull(),
    flagCaseSensitive: boolean('flag_case_sensitive').notNull().default(true),
    /** runtime abstraction: docker today; browser/cloud/standalone later */
    runtimeType: varchar('runtime_type', { length: 30 }).notNull().default('docker'),
    packageVersion: varchar('package_version', { length: 20 }).notNull().default('1.0.0'),
    packagePath: text('package_path'),
    packageSizeBytes: bigint('package_size_bytes', { mode: 'number' }),
    manifest: jsonb('manifest').$type<Record<string, unknown>>().notNull().default({}),
    prerequisiteLabIds: jsonb('prerequisite_lab_ids').$type<string[]>().notNull().default([]),
    relatedLessonIds: jsonb('related_lesson_ids').$type<string[]>().notNull().default([]),
    status: varchar('status', { length: 30 }).notNull().default('draft'),
    visibility: varchar('visibility', { length: 20 }).notNull().default('public'),
    version: integer('version').notNull().default(1),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
    securityReviewedAt: timestamp('security_reviewed_at', { withTimezone: true }),
    downloadCount: integer('download_count').notNull().default(0),
    solveCount: integer('solve_count').notNull().default(0),
    attemptCount: integer('attempt_count').notNull().default(0),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('labs_slug_uq').on(t.slug),
    index('labs_status_idx').on(t.status),
    index('labs_category_idx').on(t.categoryId),
    index('labs_difficulty_idx').on(t.difficultyId),
    index('labs_published_idx').on(t.publishedAt),
  ],
);

export const labAttempts = pgTable(
  'lab_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    labId: uuid('lab_id')
      .notNull()
      .references(() => labs.id, { onDelete: 'cascade' }),
    attemptNumber: integer('attempt_number').notNull().default(1),
    isFirstAttempt: boolean('is_first_attempt').notNull().default(true),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    solved: boolean('solved').notNull().default(false),
    solveTimeSeconds: integer('solve_time_seconds'),
    firstAttemptSolve: boolean('first_attempt_solve').notNull().default(false),
    submissionCount: integer('submission_count').notNull().default(0),
    failedSubmissionCount: integer('failed_submission_count').notNull().default(0),
    hintsUsed: integer('hints_used').notNull().default(0),
    labVersion: integer('lab_version').notNull().default(1),
    percentileOnFirstSolve: integer('percentile_on_first_solve'),
  },
  (t) => [
    index('lab_attempts_user_lab_idx').on(t.userId, t.labId),
    index('lab_attempts_lab_idx').on(t.labId),
    index('lab_attempts_solved_idx').on(t.solved),
    index('lab_attempts_completed_idx').on(t.completedAt),
  ],
);

export const hintReveals = pgTable(
  'hint_reveals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    labId: uuid('lab_id')
      .notNull()
      .references(() => labs.id, { onDelete: 'cascade' }),
    hintIndex: integer('hint_index').notNull(),
    revealedAt: timestamp('revealed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('hint_reveals_uq').on(t.userId, t.labId, t.hintIndex)],
);

export const flagSubmissions = pgTable(
  'flag_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    labId: uuid('lab_id')
      .notNull()
      .references(() => labs.id, { onDelete: 'cascade' }),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => labAttempts.id, { onDelete: 'cascade' }),
    correct: boolean('correct').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    ipHash: varchar('ip_hash', { length: 64 }),
  },
  (t) => [index('flag_submissions_user_idx').on(t.userId), index('flag_submissions_lab_idx').on(t.labId)],
);

export const labDownloads = pgTable(
  'lab_downloads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    labId: uuid('lab_id')
      .notNull()
      .references(() => labs.id, { onDelete: 'cascade' }),
    packageVersion: varchar('package_version', { length: 20 }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    ipHash: varchar('ip_hash', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('lab_downloads_lab_idx').on(t.labId)],
);

/* ============================== XP / Activity ============================= */

export const xpEvents = pgTable(
  'xp_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    source: varchar('source', { length: 40 }).notNull(),
    sourceId: varchar('source_id', { length: 100 }),
    description: varchar('description', { length: 500 }).notNull().default(''),
    categorySlug: varchar('category_slug', { length: 80 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('xp_events_user_idx').on(t.userId), index('xp_events_created_idx').on(t.createdAt), index('xp_events_source_idx').on(t.source, t.sourceId)],
);

/* ========================== Notifications & Email ========================= */

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 60 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    body: text('body').notNull().default(''),
    link: varchar('link', { length: 500 }),
    readAt: timestamp('read_at', { withTimezone: true }),
    emailedAt: timestamp('emailed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notifications_user_idx').on(t.userId, t.createdAt), index('notifications_unread_idx').on(t.userId, t.readAt)],
);

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 80 }).notNull(),
    inApp: boolean('in_app').notNull().default(true),
    email: boolean('email').notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);

export const emailOutbox = pgTable(
  'email_outbox',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    toEmail: varchar('to_email', { length: 254 }).notNull(),
    templateKey: varchar('template_key', { length: 80 }).notNull(),
    subject: varchar('subject', { length: 500 }).notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
    status: varchar('status', { length: 20 }).notNull().default('queued'),
    error: text('error'),
    attempts: integer('attempts').notNull().default(0),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('email_outbox_status_idx').on(t.status)],
);

/* ============================ Audit & Settings ============================ */

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 80 }).notNull(),
    entityType: varchar('entity_type', { length: 60 }).notNull().default(''),
    entityId: varchar('entity_id', { length: 100 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    ipHash: varchar('ip_hash', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_logs_actor_idx').on(t.actorId), index('audit_logs_created_idx').on(t.createdAt), index('audit_logs_action_idx').on(t.action)],
);

export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').$type<unknown>().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Helper for raw SQL fragments in queries */
export const nowSql = sql`now()`;
