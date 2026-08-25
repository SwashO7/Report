import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, isAdminRole } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast';
import { PublicLayout } from '@/layouts/public-layout';
import { LearnerShell } from '@/layouts/learner-shell';
import { AdminLayout } from '@/layouts/admin-layout';
import { PageLoader } from '@/components/page-loader';
import { NotFoundPage } from '@/pages/not-found';

/* ------------------------------- Public ---------------------------------- */
const LandingPage = lazy(() => import('@/pages/landing'));
const LabsPage = lazy(() => import('@/pages/labs/labs-page'));
const LabDetailPage = lazy(() => import('@/pages/labs/lab-detail-page'));
const LeaderboardPage = lazy(() => import('@/pages/leaderboard'));
const ProfilePage = lazy(() => import('@/pages/profile/profile-page'));
const ShareCardPage = lazy(() => import('@/pages/achievements/share-card-page'));
const LearnHomePage = lazy(() => import('@/pages/learn/learn-home-page'));
const PracticePage = lazy(() => import('@/pages/practice/practice-page'));
const PathPage = lazy(() => import('@/pages/learn/path-page'));

/* --------------------------------- Auth ----------------------------------- */
const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const SignupPage = lazy(() => import('@/pages/auth/signup-page'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password-page'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password-page'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email-page'));

/* -------------------------------- Learner --------------------------------- */
const OnboardingPage = lazy(() => import('@/pages/onboarding'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const LessonPage = lazy(() => import('@/pages/learn/lesson-page'));
const SettingsPage = lazy(() => import('@/pages/settings/settings-page'));

/* --------------------------------- Admin ---------------------------------- */
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/users'));
const AdminContent = lazy(() => import('@/pages/admin/content'));
const AdminLessonEditor = lazy(() => import('@/pages/admin/lesson-editor'));
const AdminLabs = lazy(() => import('@/pages/admin/labs'));
const AdminLabEditor = lazy(() => import('@/pages/admin/lab-editor'));
const AdminAchievements = lazy(() => import('@/pages/admin/achievements'));
const AdminAnalytics = lazy(() => import('@/pages/admin/analytics'));
const AdminAudit = lazy(() => import('@/pages/admin/audit'));
const AdminSettings = lazy(() => import('@/pages/admin/settings'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarded && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function RequireStaff({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminRole(user.role)) return <NotFoundPage />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const suspense = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={suspense(<LandingPage />)} />
        <Route path="labs" element={suspense(<LabsPage />)} />
        <Route path="labs/:slug" element={suspense(<LabDetailPage />)} />
        <Route path="leaderboard" element={suspense(<LeaderboardPage />)} />
        <Route path="profile/:username" element={suspense(<ProfilePage />)} />
        <Route path="achievements/:shareSlug" element={suspense(<ShareCardPage />)} />
        <Route path="learn" element={suspense(<LearnHomePage />)} />
        <Route path="practice" element={suspense(<PracticePage />)} />
        <Route path="learn/:pathSlug" element={suspense(<PathPage />)} />

        <Route path="login" element={<PublicOnly>{suspense(<LoginPage />)}</PublicOnly>} />
        <Route path="signup" element={<PublicOnly>{suspense(<SignupPage />)}</PublicOnly>} />
        <Route path="forgot-password" element={suspense(<ForgotPasswordPage />)} />
        <Route path="reset-password" element={suspense(<ResetPasswordPage />)} />
        <Route path="verify-email" element={suspense(<VerifyEmailPage />)} />
      </Route>

      <Route element={<RequireAuth><LearnerShell /></RequireAuth>}>
        <Route path="onboarding" element={suspense(<OnboardingPage />)} />
        <Route path="dashboard" element={<RequireOnboarded>{suspense(<DashboardPage />)}</RequireOnboarded>} />
        <Route path="learn/:pathSlug/:lessonSlug" element={suspense(<LessonPage />)} />
        <Route path="settings" element={suspense(<SettingsPage />)} />
      </Route>

      <Route path="admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
        <Route index element={suspense(<AdminDashboard />)} />
        <Route path="users" element={suspense(<AdminUsers />)} />
        <Route path="content" element={suspense(<AdminContent />)} />
        <Route path="content/lessons/:id" element={suspense(<AdminLessonEditor />)} />
        <Route path="labs" element={suspense(<AdminLabs />)} />
        <Route path="labs/new" element={suspense(<AdminLabEditor />)} />
        <Route path="labs/:id" element={suspense(<AdminLabEditor />)} />
        <Route path="achievements" element={suspense(<AdminAchievements />)} />
        <Route path="analytics" element={suspense(<AdminAnalytics />)} />
        <Route path="audit" element={suspense(<AdminAudit />)} />
        <Route path="settings" element={suspense(<AdminSettings />)} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

import { Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={createBrowserRouter([{ element: <AppRoutes /> }])} />
      </ToastProvider>
    </AuthProvider>
  );
}
