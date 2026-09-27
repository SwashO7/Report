/**
 * Suraksha Labs — Shared constants.
 * These are structural enums only. All tunable values (XP amounts, level
 * thresholds, categories, difficulties, achievement definitions) live in the
 * database and are managed through the admin panel.
 */

export const ROLES = [
  'learner',
  'content_editor',
  'lab_manager',
  'moderator',
  'administrator',
  'super_admin',
] as const;
export type Role = (typeof ROLES)[number];

/** Roles that can access the admin area at all. */
export const STAFF_ROLES: Role[] = ['moderator', 'administrator', 'super_admin'];
/** Roles allowed to author/edit learning content. */
export const CONTENT_ROLES: Role[] = ['content_editor', 'administrator', 'super_admin'];
/** Roles allowed to manage labs (create/publish/configure flags). */
export const LAB_MANAGE_ROLES: Role[] = ['lab_manager', 'administrator', 'super_admin'];
/** Roles allowed to publish content / labs (review gate). */
export const PUBLISH_ROLES: Role[] = ['administrator', 'super_admin'];
/** Roles allowed user administration + audit + settings. */
export const USER_ADMIN_ROLES: Role[] = ['administrator', 'super_admin'];
/** Roles allowed to create, edit, publish and delete public reports. */
export const REPORT_MANAGE_ROLES: Role[] = ['administrator', 'super_admin'];
/** Full platform control. */
export const SUPER_ADMIN_ROLES: Role[] = ['super_admin'];

export const USER_STATUSES = ['active', 'suspended', 'deleted'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUTH_PROVIDERS = ['email', 'google'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const REPORT_STATUSES = ['draft', 'published'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** Upload ceilings for report media. Enforced server-side; mirrored in the admin UI. */
export const REPORT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const REPORT_VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const REPORT_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const REPORT_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'] as const;

export const LAB_STATUSES = [
  'draft',
  'internal_testing',
  'security_review',
  'ready',
  'published',
  'archived',
] as const;
export type LabStatus = (typeof LAB_STATUSES)[number];

export const PROFILE_VISIBILITY = ['public', 'private'] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITY)[number];

export const XP_SOURCES = [
  'lesson_completion',
  'practice_completion',
  'lab_completion',
  'achievement',
  'admin_adjustment',
] as const;
export type XpSource = (typeof XP_SOURCES)[number];

export const TOKEN_TYPES = ['email_verify', 'password_reset'] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];
