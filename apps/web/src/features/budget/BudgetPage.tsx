import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, fieldErrors, type BudgetItem, type BudgetItemInput } from '../../lib/api';
import { Button, Card, Field, Input, Notice, PageHeader, Select } from '../../components/ui';
import { RecordActions } from '../../components/actions/RecordActions';
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/AsyncState';
import { getLocale } from '../../i18n';
import { calculateBudgetSummary } from './budget-summary';
import { useUnsavedChanges } from '../../components/feedback/useUnsavedChanges';
const blank = { name: '', category: '', actualCost: '' };
const categories = [
  'Venue',
  'Catering',
  'Photography',
  'Attire',
  'Flowers',
  'Decor',
  'Music',
  'Transport',
  'Other',
] as const;
export function BudgetPage() {
  const { t, i18n } = useTranslation();
  const query = useQuery({ queryKey: ['budget'], queryFn: api.budget });
  const wedding = useQuery({ queryKey: ['wedding'], queryFn: api.wedding });
  const qc = useQueryClient();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [success, setSuccess] = useState('');
  const { markClean } = useUnsavedChanges(form);
  const save = useMutation({
    mutationFn: (input: BudgetItemInput) =>
      editing ? api.updateBudget(editing.id, input) : api.createBudget(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] });
      qc.invalidateQueries({ queryKey: ['wedding'] });
      setForm(blank);
      markClean(blank);
      setEditing(null);
      setSuccess(t(editing ? 'budget.updated' : 'budget.added'));
    },
  });
  const remove = useMutation({
    mutationFn: api.deleteBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] });
      setSuccess(t('budget.deleted'));
    },
  });
  const items = query.data ?? [];
  const money = new Intl.NumberFormat(getLocale(i18n.language), {
    style: 'currency',
    currency: 'EUR',
  });
  const summary = calculateBudgetSummary(wedding.data?.budget ?? 0, items);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess('');
    const input: BudgetItemInput = {
      name: form.name,
      category: form.category,
      actualCost: form.actualCost === '' ? null : Number(form.actualCost),
    };
    // Set a safe value only for new records; edits must preserve old estimates.
    if (!editing) input.estimatedCost = 0;
    save.mutate(input);
  };
  return (
    <section>
      <PageHeader title={t('budget.title')}>
        <div className="flex flex-col items-start gap-1 text-left text-sm">
          <span>
            <b>{money.format(wedding.data?.budget ?? 0)}</b> {t('budget.totalBudget')}
          </span>
          <span className={summary.remaining < 0 ? 'font-semibold text-[var(--error)]' : undefined}>
            <b>{money.format(summary.remaining)}</b> {t('budget.remainingBudget')}
          </span>
        </div>
      </PageHeader>
      <Card>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <Field label={t('budget.item')} error={fieldErrors(save.error).name?.[0]}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label={t('budget.category')} error={fieldErrors(save.error).category?.[0]}>
            <Select
              value={form.category}
              aria-label={t('budget.category')}
              placeholder={t('budget.categoryPlaceholder')}
              required
              onChange={(category) => setForm({ ...form, category })}
              options={categories.map((category) => ({
                value: category,
                label: t(`budget.categories.${category}`),
              }))}
            />
          </Field>
          <Field label={t('budget.price')} error={fieldErrors(save.error).actualCost?.[0]}>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.actualCost}
              onChange={(e) => setForm({ ...form, actualCost: e.target.value })}
            />
          </Field>
          <div className="flex gap-2 md:col-span-3">
            <Button disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t(editing ? 'budget.save' : 'budget.add')}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                  markClean(blank);
                }}
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>
          {save.isError && (
            <p role="alert" className="text-sm text-red-700 md:col-span-3">
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
      {query.isLoading ? (
        <div className="mt-5">
          <LoadingState>{t('budget.loading')}</LoadingState>
        </div>
      ) : query.isError ? (
        <div className="mt-5">
          <ErrorState onRetry={() => query.refetch()} retryLabel={t('common.tryAgain')}>
            {t('budget.error')}
          </ErrorState>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5">
          <EmptyState>{t('budget.empty')}</EmptyState>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="p-3">{t('budget.item')}</th>
                <th className="p-3">{t('budget.category')}</th>
                <th className="p-3">{t('budget.price')}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-stone-100">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{t(`budget.categories.${item.category}`, item.category)}</td>
                  <td className="p-3">
                    {item.actualCost == null
                      ? t('common.notAvailable')
                      : money.format(item.actualCost)}
                  </td>
                  <td className="p-3 text-right">
                    <RecordActions
                      onEdit={() => {
                        setEditing(item);
                        const next = {
                          name: item.name,
                          category: item.category,
                          actualCost: item.actualCost == null ? '' : String(item.actualCost),
                        };
                        setForm(next);
                        markClean(next);
                      }}
                      onDelete={() => {
                        if (confirm(t('budget.deleteConfirm', { name: item.name })))
                          remove.mutate(item.id);
                      }}
                      deleteDisabled={remove.isPending}
                      className="justify-end"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {remove.isError && (
        <p role="alert" className="mt-4 text-sm text-[var(--error)]">
          {remove.error.message}
        </p>
      )}
      {remove.isPending && (
        <p role="status" className="mt-4 text-sm text-[var(--text-muted)]">
          {t('common.saving')}
        </p>
      )}
    </section>
  );
}
