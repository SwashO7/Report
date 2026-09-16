import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, homeForRole, isStaffRole, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast';
import { PageLoader } from '@/components/page-loader';
import { ErrorBoundary } from '@/components/error-boundary';
import { NotFoundPage } from '@/pages/not-found';
import { LearnerShellV2 } from '@/layouts/learner-shell-v2';
import { PublicLayoutV2 } from '@/layouts/public-layout-v2';
import { AdminLayout } from '@/layouts/admin-layout';

const LandingPage = lazy(() => import('@/pages/landing-v2'));
const DashboardPage = lazy(() => import('@/pages/dashboard-v2'));
const LearnHomePage = lazy(() => import('@/pages/learn/learn-home-v2'));
const ProfilePage = lazy(() => import('@/pages/profile/profile-v2'));
const LabsPage = lazy(() => import('@/pages/labs/labs-v2'));
const LabDetailPage = lazy(() => import('@/pages/labs/lab-detail-page'));
const LeaderboardPage = lazy(() => import('@/pages/leaderboard'));
const ShareCardPage = lazy(() => import('@/pages/achievements/share-card-page'));
const PracticePage = lazy(() => import('@/pages/practice/practice-page'));
const PracticeAttemptPage = lazy(() => import('@/pages/practice/practice-attempt-page'));
const PathPage = lazy(() => import('@/pages/learn/path-page'));
const LessonPage = lazy(() => import('@/pages/learn/lesson-page'));
const OnboardingPage = lazy(() => import('@/pages/onboarding'));
const SettingsPage = lazy(() => import('@/pages/settings/settings-page'));
const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const SignupPage = lazy(() => import('@/pages/auth/signup-page'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password-page'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password-page'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email-page'));
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/users'));
const AdminContent = lazy(() => import('@/pages/admin/content'));
const AdminPractice = lazy(() => import('@/pages/admin/practice'));
const AdminDiagrams = lazy(() => import('@/pages/admin/diagrams'));
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
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function RequireStaff({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStaffRole(user.role)) return <NotFoundPage />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}

function AdaptiveContentLayout() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <LearnerShellV2 /> : <PublicLayoutV2 />;
}

const suspense = (node: React.ReactNode) => (
  <RouteBoundary>
    <Suspense fallback={<PageLoader />}>{node}</Suspense>
  </RouteBoundary>
);

/**
 * Per-route error boundary. Keyed on the pathname so navigating away from a
 * failed route clears the error instead of leaving the boundary stuck. Without
 * this, a lazy chunk that fails to load unmounts the tree and the user sees a
 * blank screen with nothing to act on.
 */
function RouteBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayoutV2 />}>
        <Route index element={suspense(<LandingPage />)} />
        <Route path="achievements/:shareSlug" element={suspense(<ShareCardPage />)} />
        <Route path="login" element={<PublicOnly>{suspense(<LoginPage />)}</PublicOnly>} />
        <Route path="signup" element={<PublicOnly>{suspense(<SignupPage />)}</PublicOnly>} />
        <Route path="forgot-password" element={suspense(<ForgotPasswordPage />)} />
        <Route path="reset-password" element={suspense(<ResetPasswordPage />)} />
        <Route path="verify-email" element={suspense(<VerifyEmailPage />)} />
      </Route>

      <Route element={<AdaptiveContentLayout />}>
        <Route path="learn" element={suspense(<LearnHomePage />)} />
        <Route path="learn/:pathSlug" element={suspense(<PathPage />)} />
        <Route path="practice" element={suspense(<PracticePage />)} />
        <Route path="practice/:slug" element={suspense(<PracticeAttemptPage />)} />
        <Route path="labs" element={suspense(<LabsPage />)} />
        <Route path="labs/:slug" element={suspense(<LabDetailPage />)} />
        <Route path="leaderboard" element={suspense(<LeaderboardPage />)} />
        <Route path="profile/:username" element={suspense(<ProfilePage />)} />
      </Route>

      <Route path="onboarding" element={<RequireAuth>{suspense(<OnboardingPage />)}</RequireAuth>} />
      <Route element={<RequireAuth><LearnerShellV2 /></RequireAuth>}>
        <Route path="dashboard" element={<RequireOnboarded>{suspense(<DashboardPage />)}</RequireOnboarded>} />
        <Route path="learn/:pathSlug/:lessonSlug" element={suspense(<LessonPage />)} />
        <Route path="settings" element={suspense(<SettingsPage />)} />
      </Route>

      <Route path="admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
        <Route index element={suspense(<AdminDashboard />)} />
        <Route path="users" element={suspense(<AdminUsers />)} />
        <Route path="content" element={suspense(<AdminContent />)} />
        <Route path="practice" element={suspense(<AdminPractice />)} />
        <Route path="diagrams" element={suspense(<AdminDiagrams />)} />
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

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
