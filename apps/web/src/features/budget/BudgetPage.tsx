import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, type BudgetItem } from '../../lib/api';
import { Button, Field, Input, Notice, State } from '../../components/ui';
import { getLocale } from '../../i18n';
const blank = { name: '', category: '', estimatedCost: '0', actualCost: '' };
export function BudgetPage() {
  const { t, i18n } = useTranslation();
  const query = useQuery({ queryKey: ['budget'], queryFn: api.budget });
  const qc = useQueryClient();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [success, setSuccess] = useState('');
  const save = useMutation({
    mutationFn: (input: Omit<BudgetItem, 'id'>) =>
      editing ? api.updateBudget(editing.id, input) : api.createBudget(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget'] });
      setForm(blank);
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
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess('');
    save.mutate({
      name: form.name,
      category: form.category,
      estimatedCost: Number(form.estimatedCost),
      actualCost: form.actualCost === '' ? null : Number(form.actualCost),
    });
  };
  return (
    <section>
      <h2 className="text-2xl font-bold">{t('budget.title')}</h2>
      <div className="mt-3 flex gap-6 text-sm">
        <span>
          <b>{money.format(items.reduce((x, item) => x + item.estimatedCost, 0))}</b>{' '}
          {t('budget.estimated')}
        </span>
        <span>
          <b>{money.format(items.reduce((x, item) => x + (item.actualCost ?? 0), 0))}</b>{' '}
          {t('budget.actual')}
        </span>
      </div>
      <form
        onSubmit={submit}
        className="mt-6 grid gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200 md:grid-cols-4"
      >
        <Field label={t('budget.item')}>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>
        <Field label={t('budget.category')}>
          <Input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
        </Field>
        <Field label={t('budget.estimatedCost')}>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.estimatedCost}
            onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
            required
          />
        </Field>
        <Field label={t('budget.actualCost')}>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.actualCost}
            onChange={(e) => setForm({ ...form, actualCost: e.target.value })}
          />
        </Field>
        <div className="flex gap-2 md:col-span-4">
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
              }}
            >
              {t('common.cancel')}
            </Button>
          )}
        </div>
        {save.isError && (
          <p role="alert" className="text-sm text-red-700 md:col-span-4">
            {save.error.message}
          </p>
        )}
      </form>
      {success && (
        <div className="mt-4">
          <Notice>{success}</Notice>
        </div>
      )}
      {query.isLoading ? (
        <div className="mt-5">
          <State>{t('budget.loading')}</State>
        </div>
      ) : query.isError ? (
        <div className="mt-5">
          <State>
            {t('budget.error')}{' '}
            <button className="underline" onClick={() => query.refetch()}>
              {t('common.tryAgain')}
            </button>
          </State>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5">
          <State>{t('budget.empty')}</State>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="p-3">{t('budget.item')}</th>
                <th className="p-3">{t('budget.category')}</th>
                <th className="p-3">{t('budget.estimatedCost')}</th>
                <th className="p-3">{t('budget.actualCost')}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-stone-100">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{money.format(item.estimatedCost)}</td>
                  <td className="p-3">
                    {item.actualCost == null
                      ? t('common.notAvailable')
                      : money.format(item.actualCost)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="mr-3 text-rose-800 underline"
                      onClick={() => {
                        setEditing(item);
                        setForm({
                          name: item.name,
                          category: item.category,
                          estimatedCost: String(item.estimatedCost),
                          actualCost: item.actualCost == null ? '' : String(item.actualCost),
                        });
                      }}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      className="text-red-700 underline"
                      onClick={() => {
                        if (confirm(t('budget.deleteConfirm', { name: item.name })))
                          remove.mutate(item.id);
                      }}
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
