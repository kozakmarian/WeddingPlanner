import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  IoCalendarOutline,
  IoCheckmarkDoneOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoSunnyOutline,
  IoWalletOutline,
} from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../features/auth/AuthProvider';

const navigation = [
  ['/', 'nav.overview', IoCalendarOutline],
  ['/guests', 'nav.guests', IoPeopleOutline],
  ['/budget', 'nav.budget', IoWalletOutline],
  ['/tasks', 'nav.tasks', IoCheckmarkDoneOutline],
  ['/settings', 'nav.settings', IoSettingsOutline],
] as const;

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const navItems = (mobile = false) =>
    navigation.map(([to, label, Icon]) => (
      <NavLink
        end={to === '/'}
        key={to}
        to={to}
        className={({ isActive }) =>
          mobile
            ? `flex min-w-0 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-light)]'}`
            : `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[#e8d5c0] hover:bg-white/10 hover:text-white'}`
        }
      >
        <Icon aria-hidden="true" className={mobile ? 'text-base' : 'text-lg'} />
        <span>{t(label)}</span>
      </NavLink>
    ));

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] md:flex">
      <aside className="hidden min-h-screen w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background-dark)] p-6 text-white md:flex">
        <div className="mb-12 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-[var(--primary)] text-xl">
            ♥
          </span>
          <div>
            <h1 className="font-serif text-xl font-bold">{t('brand.name')}</h1>
            <p className="text-xs text-[#d8c9bb]">{t('brand.tagline')}</p>
          </div>
        </div>
        <nav className="space-y-2">{navItems()}</nav>
        <div className="mt-auto border-t border-white/15 pt-5">
          <p className="truncate text-sm text-[#e8d5c0]">{user?.email}</p>
          <button
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#e8d5c0] transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
            onClick={signOut}
          >
            <IoLogOutOutline aria-hidden="true" className="text-lg" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>
      <main className="min-h-screen w-full pb-24 md:pb-8">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-5 py-4 md:justify-end md:bg-transparent md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--primary)] text-lg text-white">
              ♥
            </span>
            <span className="font-serif font-bold text-[var(--text)]">{t('brand.name')}</span>
          </div>
          <button
            aria-label={t('theme.toggle')}
            onClick={() => setDark((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-muted)]"
          >
            <IoSunnyOutline aria-hidden="true" />
            {dark ? t('theme.light') : t('theme.dark')}
          </button>
        </header>
        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          <Outlet />
        </div>
      </main>
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-[var(--border)] bg-[var(--background)] px-1 py-2 shadow-[0_-4px_18px_#00000012] md:hidden"
      >
        {navItems(true)}
      </nav>
    </div>
  );
}
