import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppShell } from './components/AppShell';
import { LoginPage, RegisterPage } from './features/auth/AuthPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { WeddingSettingsPage } from './features/wedding-settings/WeddingSettingsPage';
import { GuestsPage } from './features/guests/GuestsPage';
import { BudgetPage } from './features/budget/BudgetPage';
import { TasksPage } from './features/tasks/TasksPage';
import { useAuth } from './features/auth/AuthProvider';
function Restoring() {
  const { t } = useTranslation();
  return <main className="p-8">{t('router.restoring')}</main>;
}
function Protected() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Restoring />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
function Public({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Restoring />;
  return user ? <Navigate to="/" replace /> : children;
}
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Public>
        <LoginPage />
      </Public>
    ),
  },
  {
    path: '/register',
    element: (
      <Public>
        <RegisterPage />
      </Public>
    ),
  },
  {
    Component: Protected,
    children: [
      {
        Component: AppShell,
        children: [
          { path: '/', Component: DashboardPage },
          { path: '/guests', Component: GuestsPage },
          { path: '/budget', Component: BudgetPage },
          { path: '/tasks', Component: TasksPage },
          { path: '/settings', Component: WeddingSettingsPage },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
