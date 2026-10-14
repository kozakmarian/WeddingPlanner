import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { IoCheckmarkDoneOutline, IoPeopleOutline, IoWalletOutline } from 'react-icons/io5';
import { api } from '../../lib/api';
import { Card, PageHeader, State } from '../../components/ui';
import { getLocale } from '../../i18n';
import { calculateBudgetSummary } from '../budget/budget-summary';
import { daysUntilWedding, weddingDateFromValue } from './dashboard-utils';
export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [wedding, guests, budget, tasks] = useQueries({
    queries: [
      { queryKey: ['wedding'], queryFn: api.wedding },
      { queryKey: ['guests'], queryFn: api.guests },
      { queryKey: ['budget'], queryFn: api.budget },
      { queryKey: ['tasks'], queryFn: api.tasks },
    ],
  });
  if ([wedding, guests, budget, tasks].some((q) => q.isLoading))
    return <State>{t('dashboard.loading')}</State>;
  if ([wedding, guests, budget, tasks].some((q) => q.isError))
    return <State>{t('dashboard.error')}</State>;
  const locale = getLocale(i18n.language);
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const weddingDate = weddingDateFromValue(wedding.data!.date);
  const days = daysUntilWedding(wedding.data!.date);
  const confirmed = guests.data!.filter((guest) => guest.attendance === 'ATTENDING').length;
  const budgetSummary = calculateBudgetSummary(wedding.data!.budget ?? 0, budget.data!);
  const complete = tasks.data!.filter((task) => task.completed).length;
  const couple = [wedding.data!.groomName, wedding.data!.brideName].filter(Boolean).join(' & ');
  const cards = [
    [
      t('dashboard.guests'),
      String(guests.data!.length),
      t('dashboard.confirmed', { count: confirmed }),
      IoPeopleOutline,
    ],
    [
      t('dashboard.budget'),
      money.format(budgetSummary.remaining),
      t('dashboard.remaining'),
      IoWalletOutline,
    ],
    [
      t('dashboard.tasks'),
      `${complete}/${tasks.data!.length}`,
      t('dashboard.toComplete', { count: tasks.data!.length - complete }),
      IoCheckmarkDoneOutline,
    ],
  ] as const;
  return (
    <section>
      <PageHeader title={couple || wedding.data!.name || t('dashboard.yourWedding')} />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
        <Card className="overflow-hidden border-none bg-[var(--primary-dark)] p-0 text-white shadow-[var(--shadow-md)]">
          <div className="p-7 sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#e8d5c0]">
              {t('dashboard.countdown')}
            </p>
            <p className="mt-4 font-serif text-6xl font-bold tracking-tight">
              {days == null ? '—' : Math.max(days, 0)}
            </p>
            <p className="mt-1 text-xl text-[#f5e6d3]">
              {days == null || days >= 0 ? t('dashboard.daysUntil') : t('dashboard.remember')}
            </p>
            <p className="mt-7 max-w-md text-sm leading-6 text-[#e8d5c0]">
              {weddingDate
                ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(weddingDate)
                : t('common.notAvailable')}
            </p>
          </div>
        </Card>
        <Card className="flex flex-col justify-center bg-[var(--beige-light)]">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--primary)]">
            {t('dashboard.celebration')}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[var(--text)]">
            {couple || wedding.data!.name}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {t('dashboard.celebrationSummary')}
          </p>
        </Card>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, hint, Icon]) => (
          <Card key={label} className="relative overflow-hidden">
            <Icon
              aria-hidden="true"
              className="absolute right-5 top-4 text-2xl text-[var(--primary-light)]"
            />
            <p className="text-sm font-semibold text-[var(--text-muted)]">{label}</p>
            <p
              className={`mt-3 text-2xl font-bold ${
                label === t('dashboard.budget') && budgetSummary.remaining < 0
                  ? 'text-[var(--error)]'
                  : 'text-[var(--text)]'
              }`}
            >
              {value}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{hint}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
