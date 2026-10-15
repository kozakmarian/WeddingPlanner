import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, fieldErrors, type Task } from '../../lib/api';
import { Button, Card, Field, Input, Notice, PageHeader, State } from '../../components/ui';
import { RecordActions } from '../../components/actions/RecordActions';
import { getLocale } from '../../i18n';
import { useUnsavedChanges } from '../../components/feedback/useUnsavedChanges';
import { ErrorState } from '../../components/feedback/AsyncState';

const blank = { title: '', description: '', dueDate: '' };

export function TasksPage() {
  const { t, i18n } = useTranslation();
  const query = useQuery({ queryKey: ['tasks'], queryFn: api.tasks });
  const qc = useQueryClient();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Task | null>(null);
  const [success, setSuccess] = useState('');
  const { markClean } = useUnsavedChanges(form);
  const save = useMutation({
    mutationFn: (input: Omit<Task, 'id' | 'completed'>) =>
      editing ? api.updateTask(editing.id, input) : api.createTask({ ...input, completed: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setForm(blank);
      markClean(blank);
      setEditing(null);
      setSuccess(t(editing ? 'tasks.updated' : 'tasks.added'));
    },
  });
  const remove = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setSuccess(t('tasks.deleted'));
    },
  });
  const toggle = useMutation({
    mutationFn: (task: Task) => api.updateTask(task.id, { completed: !task.completed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setSuccess(t('tasks.statusUpdated'));
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    setSuccess('');
    save.mutate({
      title: form.title,
      description: form.description || null,
      dueDate: form.dueDate || null,
    });
  }
  return (
    <section>
      <PageHeader title={t('tasks.title')}>
        <p className="text-sm text-[var(--text-muted)]">
          {t('tasks.pending', { count: query.data?.filter((task) => !task.completed).length ?? 0 })}
        </p>
      </PageHeader>
      <Card>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <Field label={t('tasks.task')} error={fieldErrors(save.error).title?.[0]}>
            <Input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </Field>
          <Field label={t('tasks.description')} error={fieldErrors(save.error).description?.[0]}>
            <Input
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </Field>
          <Field label={t('tasks.dueDate')} error={fieldErrors(save.error).dueDate?.[0]}>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
          </Field>
          <div className="flex gap-2 md:col-span-3">
            <Button disabled={save.isPending}>
              {save.isPending ? t('common.saving') : t(editing ? 'tasks.save' : 'tasks.add')}
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
            <p role="alert" className="text-sm text-[var(--error)] md:col-span-3">
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
      {remove.isError && (
        <p role="alert" className="mt-4 text-sm text-[var(--error)]">
          {remove.error.message}
        </p>
      )}
      {toggle.isError && (
        <p role="alert" className="mt-4 text-sm text-[var(--error)]">
          {toggle.error.message}
        </p>
      )}
      {(remove.isPending || toggle.isPending) && (
        <p role="status" className="mt-4 text-sm text-[var(--text-muted)]">
          {t('common.saving')}
        </p>
      )}
      {query.isLoading ? (
        <div className="mt-5">
          <State>{t('tasks.loading')}</State>
        </div>
      ) : query.isError ? (
        <div className="mt-5">
          <ErrorState onRetry={() => query.refetch()} retryLabel={t('common.tryAgain')}>
            {t('tasks.error')}
          </ErrorState>
        </div>
      ) : query.data!.length === 0 ? (
        <div className="mt-5">
          <State>{t('tasks.empty')}</State>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-[var(--border)] rounded-xl bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)]">
          {query.data!.map((task) => (
            <li key={task.id} className="flex gap-3 p-4">
              <input
                aria-label={t('tasks.markComplete', { title: task.title })}
                type="checkbox"
                checked={task.completed}
                disabled={toggle.isPending}
                aria-busy={toggle.isPending}
                onChange={() => toggle.mutate(task)}
                className="mt-1 size-4 accent-rose-800"
              />
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${task.completed ? 'text-stone-400 line-through' : ''}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{task.description}</p>
                )}
                {task.dueDate && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {t('tasks.due', {
                      date: new Date(task.dueDate).toLocaleDateString(getLocale(i18n.language)),
                    })}
                  </p>
                )}
              </div>
              <RecordActions
                onEdit={() => {
                  setEditing(task);
                  const next = {
                    title: task.title,
                    description: task.description ?? '',
                    dueDate: task.dueDate?.slice(0, 10) ?? '',
                  };
                  setForm(next);
                  markClean(next);
                }}
                onDelete={() => {
                  if (confirm(t('tasks.deleteConfirm', { name: task.title })))
                    remove.mutate(task.id);
                }}
                deleteDisabled={remove.isPending}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
