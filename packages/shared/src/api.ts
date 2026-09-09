import type { Pagination } from './schemas';
import type { ContentBlock } from './content';
import type { ProfileVisibility, Role, UserStatus } from './constants';

/** Public-safe user representation (never includes email unless self/admin). */
export interface PublicUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: Role;
  xp: number;
  level: LevelInfo | null;
}

export interface SelfUser extends PublicUser {
  email: string;
  status: UserStatus;
  authProvider: string;
  emailVerified: boolean;
  onboarded: boolean;
  experienceLevel: string | null;
  interests: string[];
  bio: string | null;
  profileVisibility: ProfileVisibility;
  createdAt: string;
  lastActiveAt: string;
}

export interface LevelInfo {
  id: number;
  order: number;
  name: string;
  title: string;
  xpThreshold: number;
}

export interface XpProgress {
  xp: number;
  level: LevelInfo | null;
  nextLevel: LevelInfo | null;
  levelStartXp: number;
  nextLevelXp: number | null;
  progressPercent: number;
  xpToNextLevel: number | null;
}

/** ---------- Learning ---------- */

export interface LearningPath {
  id: string;
  slug: string;
  name: string;
  levelNumber: number;
  description: string;
  lessonCount?: number;
  completedLessonCount?: number;
  published: boolean;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  orderIndex: number;
  hasVideo: boolean;
  hasPractice: boolean;
  completed: boolean;
  started: boolean;
}

export interface ModuleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: LessonSummary[];
}

export interface PathDetail extends LearningPath {
  modules: ModuleSummary[];
}

export interface ExercisePublic {
  id: string;
  slug: string;
  title: string;
  instructions: string;
  kind: 'quiz';
  questions: { prompt: string; options: string[] }[];
  xpReward: number;
  completed: boolean;
}

export interface ExerciseResult {
  passed: boolean;
  score: number;
  total: number;
  perQuestion: { index: number; correct: boolean; correctIndex: number; explanation?: string }[];
  xpAwarded: number;
  firstCompletion: boolean;
}

export interface LessonDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  blocks: ContentBlock[];
  moduleSlug: string;
  moduleTitle: string;
  pathSlug: string;
  pathName: string;
  levelNumber: number;
  prevLesson: { slug: string; title: string } | null;
  nextLesson: { slug: string; title: string } | null;
  progress: { started: boolean; completed: boolean; completedAt: string | null };
  relatedLabs: { slug: string; title: string; shortDescription: string; difficulty: string; xpReward: number; solved: boolean }[];
  exercises: ExercisePublic[];
}

export interface Recommendation {
  type: 'lesson' | 'exercise' | 'lab';
  reason: string;
  lesson?: { slug: string; title: string; moduleTitle: string };
  exercise?: { slug: string; title: string };
  lab?: { slug: string; title: string };
}

/** ---------- Labs ---------- */

export interface LabCard {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: { slug: string; name: string };
  difficulty: { slug: string; label: string; orderIndex: number };
  estimatedMinutes: number;
  xpReward: number;
  skills: string[];
  solvedByCount: number;
  solved: boolean;
  inProgress: boolean;
  publishedAt: string | null;
}

export interface LabDetail extends LabCard {
  description: string;
  objectives: string[];
  setupInstructions: string;
  prerequisites: { slug: string; title: string; solved: boolean }[];
  hintsTotal: number;
  hintsRevealed: { index: number; content: string }[];
  attempt: {
    id: string;
    startedAt: string;
    submissionCount: number;
    hintsUsed: number;
    solved: boolean;
    completedAt: string | null;
  } | null;
  relatedLessons: { slug: string; title: string; completed: boolean }[];
  packageVersion: string;
  packageSizeBytes: number;
  /** Lifecycle state. Only ever non-'published' for staff previewing a lab. */
  status: string;
  visibility: string;
  /** False when learners cannot see this lab yet, whatever staff can see. */
  visibleToLearners: boolean;
}

export interface FlagSubmitResult {
  correct: boolean;
  alreadySolved: boolean;
  xpAwarded: number;
  solveTimeSeconds: number | null;
  firstAttemptSolve: boolean;
  percentile: number | null;
  newAchievements: AchievementPublic[];
  shareSlug: string | null;
}

/** ---------- Gamification ---------- */

export interface AchievementPublic {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

export interface UserAchievementPublic extends AchievementPublic {
  unlockedAt: string;
  shareSlug: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: { username: string; name: string; avatarUrl: string | null };
  value: number;
  labsSolved?: number;
  achievementCount?: number;
}

export interface LeaderboardResponse {
  scope: { kind: 'global' | 'category' | 'season'; label: string };
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  pagination: Pagination;
}

/** ---------- Notifications ---------- */

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

/** ---------- Admin ---------- */

export interface AdminStats {
  users: { total: number; active7d: number; active30d: number; new30d: number };
  learning: { lessonsStarted: number; lessonsCompleted: number; avgPerUser: number };
  labs: { attempts: number; solves: number; completionRate: number; avgHoursToSolve: number | null };
  engagement: { dau: number; wau: number; mau: number; avgStreak: number };
  content: { publishedLessons: number; draftLessons: number; publishedLabs: number; draftLabs: number };
  signupTrend: { date: string; count: number }[];
  activityTrend: { date: string; count: number }[];
  popularLabs: { slug: string; title: string; attempts: number; solves: number }[];
  hardestLabs: { slug: string; title: string; solveRatePct: number }[];
}

export interface LabAnalytics {
  lab: { slug: string; title: string };
  starts: number;
  completions: number;
  completionRatePct: number;
  avgMinutes: number | null;
  medianMinutes: number | null;
  firstAttemptSuccessPct: number | null;
  hintUsageAvg: number | null;
  retryRatePct: number | null;
  failedSubmissions: number;
  dropOffStage: string | null;
  recentAttempts: {
    username: string;
    startedAt: string;
    completedAt: string | null;
    submissionCount: number;
    hintsUsed: number;
  }[];
}

export interface AuditLogEntry {
  id: string;
  actor: { username: string; name: string } | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipHash: string | null;
  createdAt: string;
}

export interface ShareCardData {
  shareSlug: string;
  user: { name: string; username: string; avatarUrl: string | null };
  achievement: AchievementPublic;
  lab: { slug: string; title: string } | null;
  xpAwarded: number;
  solveTimeSeconds: number | null;
  percentile: number | null;
  unlockedAt: string;
}
