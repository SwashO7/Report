import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from './api';

/** Standard query key factory — keeps cache invalidation predictable. */
export const qk = {
  me: ['me'] as const,
  paths: ['learn', 'paths'] as const,
  path: (slug: string) => ['learn', 'path', slug] as const,
  lesson: (slug: string) => ['learn', 'lesson', slug] as const,
  continue: ['learn', 'continue'] as const,
  practice: ['learn', 'practice'] as const,
  labs: (params: string) => ['labs', params] as const,
  lab: (slug: string) => ['labs', 'detail', slug] as const,
  labMeta: ['labs', 'meta'] as const,
  leaderboard: (params: string) => ['leaderboard', params] as const,
  achievements: ['achievements'] as const,
  myAchievements: ['achievements', 'mine'] as const,
  dashboard: ['dashboard'] as const,
  profile: (username: string) => ['profile', username] as const,
  notifications: ['notifications'] as const,
  notificationPrefs: ['notification-prefs'] as const,
  sessions: ['sessions'] as const,
  shareCard: (slug: string) => ['share', slug] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: (params: string) => ['admin', 'users', params] as const,
  adminPaths: ['admin', 'paths'] as const,
  adminLessons: (params: string) => ['admin', 'lessons', params] as const,
  adminLesson: (id: string) => ['admin', 'lesson', id] as const,
  adminLabs: (params: string) => ['admin', 'labs', params] as const,
  adminLab: (id: string) => ['admin', 'lab', id] as const,
  adminLabAnalytics: (id: string) => ['admin', 'lab-analytics', id] as const,
  adminAchievements: ['admin', 'achievements'] as const,
  adminAudit: (params: string) => ['admin', 'audit', params] as const,
  adminSettings: ['admin', 'settings'] as const,
  adminLessonAnalytics: ['admin', 'lesson-analytics'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: () => api<{ user: import('@suraksha/shared').SelfUser | null }>('/auth/me'),
    retry: false,
    staleTime: 60_000,
  });
}

export function useInvalidateOnAuthChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries();
    },
    mutationKey: ['invalidate-all'],
  });
}
