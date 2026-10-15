import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, fieldErrors, type Guest } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Notice,
  PageHeader,
  Select,
  State,
} from '../../components/ui';
import { RecordActions } from '../../components/actions/RecordActions';
import { useUnsavedChanges } from '../../components/feedback/useUnsavedChanges';
import { ErrorState } from '../../components/feedback/AsyncState';
const blank = {
  name: '',
  email: '',
  attendance: 'PENDING' as Guest['attendance'],
  accompanyingGuests: '0',
};
const tone = { ATTENDING: 'success', PENDING: 'warning', DECLINED: 'error' } as const;
export function GuestsPage() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ['guests'], queryFn: api.guests });
  const qc = useQueryClient();
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState<Guest | null>(null);
  const [success, setSuccess] = useState('');
  const { markClean } = useUnsavedChanges(f);
  const save = useMutation({
    mutationFn: (x: Omit<Guest, 'id'>) => (edit ? api.updateGuest(edit.id, x) : api.createGuest(x)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guests'] });
      setF(blank);
      markClean(blank);
      setEdit(null);
      setSuccess(t('guests.saved'));
    },
  });
  const saveErrors = fieldErrors(save.error);
  const del = useMutation({
    mutationFn: api.deleteGuest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guests'] });
      setSuccess(t('guests.deleted'));
    },
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    save.mutate({
      name: f.name,
      email: f.email || null,
      attendance: f.attendance,
      accompanyingGuests: Number(f.accompanyingGuests),
    });
  }
  function start(g: Guest) {
    setEdit(g);
    const next = {
      name: g.name,
      email: g.email ?? '',
      attendance: g.attendance,
      accompanyingGuests: String(g.accompanyingGuests),
    };
    setF(next);
    markClean(next);
  }
  if (q.isLoading) return <State>{t('guests.loading')}</State>;
  if (q.isError)
    return (
      <ErrorState onRetry={() => q.refetch()} retryLabel={t('common.tryAgain')}>
        {t('guests.error')}
      </ErrorState>
    );
  return (
    <section>
      <PageHeader title={t('guests.title')}>
        <p className="text-sm text-[var(--text-muted)]">
          {t('guests.invited', { count: q.data!.length })}
        </p>
      </PageHeader>
      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-4">
          <Field label={t('guests.name')} error={saveErrors.name?.[0]}>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          </Field>
          <Field label={t('guests.email')} error={saveErrors.email?.[0]}>
            <Input
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Field>
          <Field label={t('guests.attendance')} error={saveErrors.attendance?.[0]}>
            <Select
              value={f.attendance}
              aria-label={t('guests.attendance')}
              onChange={(attendance) =>
                setF({ ...f, attendance: attendance as Guest['attendance'] })
              }
              options={[
                { value: 'PENDING', label: t('guests.pending') },
                { value: 'ATTENDING', label: t('guests.attending') },
                { value: 'DECLINED', label: t('guests.declined') },
              ]}
            />
          </Field>
          <Field label={t('guests.plusOnes')} error={saveErrors.accompanyingGuests?.[0]}>
            <Input
              type="number"
              min="0"
              value={f.accompanyingGuests}
              onChange={(e) => setF({ ...f, accompanyingGuests: e.target.value })}
            />
          </Field>
          <div className="flex gap-2 md:col-span-4">
            <Button disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t(edit ? 'guests.save' : 'guests.add')}
            </Button>
            {edit && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEdit(null);
                  setF(blank);
                  markClean(blank);
                }}
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>
          {save.isError && (
            <p
              role={Object.keys(saveErrors).length === 0 ? 'alert' : undefined}
              className="text-sm text-[var(--error-text)] md:col-span-4"
            >
              {save.error.message}
            </p>
          )}
        </form>
      </Card>
      {success && (
        <div className="mt-4">
          <Notice>{success}</Notice>
        </div>
      )}
      {del.isError && (
        <p role="alert" className="mt-4 text-sm text-[var(--error-text)]">
          {del.error.message}
        </p>
      )}
      {del.isPending && (
        <p role="status" className="mt-4 text-sm text-[var(--text-muted)]">
          {t('common.saving')}
        </p>
      )}
      <div className="mt-5 grid gap-3">
        {q.data!.length === 0 ? (
          <State>{t('guests.empty')}</State>
        ) : (
          q.data!.map((g) => (
            <Card key={g.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="min-w-40 flex-1">
                <p className="font-bold">{g.name}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {g.email ?? t('guests.noEmail')} ·{' '}
                  {t('guests.plusOnesCount', { count: g.accompanyingGuests })}
                </p>
              </div>
              <Badge tone={tone[g.attendance]}>{t(`guests.${g.attendance.toLowerCase()}`)}</Badge>
              <RecordActions
                onEdit={() => start(g)}
                onDelete={() => {
                  if (confirm(t('guests.deleteConfirm', { name: g.name }))) del.mutate(g.id);
                }}
                deleteDisabled={del.isPending}
              />
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
