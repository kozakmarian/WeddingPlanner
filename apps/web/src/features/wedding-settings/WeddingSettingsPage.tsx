import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, fieldErrors } from '../../lib/api';
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
import { useUnsavedChanges } from '../../components/feedback/useUnsavedChanges';
import { ErrorState } from '../../components/feedback/AsyncState';

export function WeddingSettingsPage() {
  const { t, i18n } = useTranslation();
  const client = useQuery({ queryKey: ['wedding'], queryFn: api.wedding });
  const qc = useQueryClient();
  const [form, setForm] = useState({ groomName: '', brideName: '', date: '', budget: '0' });
  const [success, setSuccess] = useState('');
  const { markClean } = useUnsavedChanges(form);
  useEffect(() => {
    if (client.data) {
      const next = {
        groomName: client.data.groomName ?? '',
        brideName: client.data.brideName ?? '',
        date: client.data.date.slice(0, 10),
        budget: String(client.data.budget),
      };
      setForm(next);
      markClean(next);
    }
  }, [client.data]);
  const save = useMutation({
    mutationFn: api.updateWedding,
    onSuccess: (w) => {
      qc.setQueryData(['wedding'], w);
      markClean(form);
      setSuccess(t('settings.saved'));
    },
  });
  if (client.isLoading) return <State>{t('settings.loading')}</State>;
  if (client.isError)
    return (
      <ErrorState onRetry={() => client.refetch()} retryLabel={t('common.tryAgain')}>
        {t('settings.error')}
      </ErrorState>
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
            <Field label={t('settings.groomName')} error={fieldErrors(save.error).groomName?.[0]}>
              <Input
                value={form.groomName}
                onChange={(event) => setForm({ ...form, groomName: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.brideName')} error={fieldErrors(save.error).brideName?.[0]}>
              <Input
                value={form.brideName}
                onChange={(event) => setForm({ ...form, brideName: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.date')} error={fieldErrors(save.error).date?.[0]}>
              <DateInput
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </Field>
            <Field label={t('settings.budget')} error={fieldErrors(save.error).budget?.[0]}>
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
          <div className="text-sm font-semibold text-[var(--text)]">
            <span>{t('settings.language')}</span>
            <Select
              value={i18n.language}
              aria-label={t('settings.language')}
              onChange={(language) => i18n.changeLanguage(language)}
              options={supportedLanguages.map((language) => ({
                value: language,
                label: t(language === 'en' ? 'settings.english' : 'settings.slovak'),
              }))}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
