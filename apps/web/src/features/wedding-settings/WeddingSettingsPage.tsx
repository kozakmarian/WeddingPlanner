import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import {
  Button,
  Card,
  DateInput,
  Field,
  Input,
  Notice,
  PageHeader,
  Select,
  State,
} from '../../components/ui';
import { supportedLanguages } from '../../i18n';

export function WeddingSettingsPage() {
  const { t, i18n } = useTranslation();
  const client = useQuery({ queryKey: ['wedding'], queryFn: api.wedding });
  const qc = useQueryClient();
  const [form, setForm] = useState({ groomName: '', brideName: '', date: '', budget: '0' });
  const [success, setSuccess] = useState('');
  useEffect(() => {
    if (client.data)
      setForm({
        groomName: client.data.groomName ?? '',
        brideName: client.data.brideName ?? '',
        date: client.data.date.slice(0, 10),
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
      groomName: form.groomName,
      brideName: form.brideName,
      date: form.date,
      budget: Number(form.budget),
    });
  };
  return (
    <section>
      <PageHeader title={t('settings.title')} />
      <div className="grid max-w-2xl gap-5">
        <Card>
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <Field label={t('settings.groomName')}>
              <Input
                value={form.groomName}
                onChange={(event) => setForm({ ...form, groomName: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.brideName')}>
              <Input
                value={form.brideName}
                onChange={(event) => setForm({ ...form, brideName: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.date')}>
              <DateInput
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
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
          <label className="block text-sm font-semibold text-[var(--text)]">
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
