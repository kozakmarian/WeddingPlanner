import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Button, Card, Field, Input, Notice, PageHeader, Select, State } from '../../components/ui';
import { supportedLanguages } from '../../i18n';

export function WeddingSettingsPage() {
  const { t, i18n } = useTranslation();
  const client = useQuery({ queryKey: ['wedding'], queryFn: api.wedding });
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', date: '', location: '', budget: '0' });
  const [success, setSuccess] = useState('');
  useEffect(() => {
    if (client.data)
      setForm({
        name: client.data.name,
        date: client.data.date.slice(0, 10),
        location: client.data.location,
        budget: String(client.data.budget),
      });
  }, [client.data]);
  const save = useMutation({
    mutationFn: api.updateWedding,
    onSuccess: (w) => {
      qc.setQueryData(['wedding'], w);
      setSuccess(t('settings.saved'));
    },
  });
  if (client.isLoading) return <State>{t('settings.loading')}</State>;
  if (client.isError)
    return (
      <State>
        {t('settings.error')}{' '}
        <button className="underline" onClick={() => client.refetch()}>
          {t('common.tryAgain')}
        </button>
      </State>
    );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSuccess('');
    save.mutate({
      name: form.name,
      date: form.date,
      location: form.location,
      budget: Number(form.budget),
    });
  };
  return (
    <section>
      <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} />
      <div className="grid max-w-2xl gap-5">
        <Card>
          <p className="mb-6 text-sm text-[var(--text-muted)]">{t('settings.summary')}</p>
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <Field label={t('settings.name')}>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.date')}>
              <Input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.location')}>
              <Input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.budget')}>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={(event) => setForm({ ...form, budget: event.target.value })}
                required
              />
            </Field>
            <div className="sm:col-span-2">
              {save.isError && (
                <p role="alert" className="mb-3 text-sm text-[var(--error)]">
                  {save.error.message}
                </p>
              )}
              {success && (
                <div className="mb-3">
                  <Notice>{success}</Notice>
                </div>
              )}
              <Button disabled={save.isPending}>
                {save.isPending ? t('common.saving') : t('settings.save')}
              </Button>
            </div>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-[var(--text)]">{t('settings.language')}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.languageSummary')}</p>
          <label className="mt-4 block text-sm font-semibold text-[var(--text)]">
            <span>{t('settings.language')}</span>
            <Select
              value={i18n.language}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
            >
              {supportedLanguages.map((language) => (
                <option key={language} value={language}>
                  {t(language === 'en' ? 'settings.english' : 'settings.slovak')}
                </option>
              ))}
            </Select>
          </label>
        </Card>
      </div>
    </section>
  );
}
