import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, type Task } from '../../lib/api';
import { Button, Card, Field, Input, Notice, PageHeader, State } from '../../components/ui';
import { RecordActions } from '../../components/actions/RecordActions';
const blank = { title: '', description: '', dueDate: '' };
export function TasksPage() {
  const { t } = useTranslation();
  const query = useQuery({ queryKey: ['tasks'], queryFn: api.tasks });
  const qc = useQueryClient();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Task | null>(null);
  const [success, setSuccess] = useState('');
  const save = useMutation({
    mutationFn: (input: Omit<Task, 'id' | 'completed'>) =>
      editing ? api.updateTask(editing.id, input) : api.createTask({ ...input, completed: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setForm(blank);
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
  function submit(e: FormEvent) {
    e.preventDefault();
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
      <p className="-mt-5 mb-6 text-[var(--text-muted)]">{t('tasks.subtitle')}</p>
      <Card>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <Field label={t('tasks.task')}>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Field>
          <Field label={t('tasks.description')}>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label={t('tasks.dueDate')}>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </Field>
          <div className="md:col-span-3 flex gap-2">
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
      {query.isLoading ? (
        <div className="mt-5">
          <State>Loading tasks…</State>
        </div>
      ) : query.isError ? (
        <div className="mt-5">
          <State>
            Could not load tasks.{' '}
            <button className="underline" onClick={() => query.refetch()}>
              Try again
            </button>
          </State>
        </div>
      ) : query.data!.length === 0 ? (
        <div className="mt-5">
          <State>No tasks yet. Add the next thing you need to do.</State>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-[var(--border)] rounded-xl bg-[var(--background)] shadow-sm ring-1 ring-[var(--border)]">
          {query.data!.map((task) => (
            <li key={task.id} className="flex gap-3 p-4">
              <input
                aria-label={`Mark ${task.title} complete`}
                type="checkbox"
                checked={task.completed}
                disabled={toggle.isPending}
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
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <RecordActions
                onEdit={() => {
                  setEditing(task);
                  setForm({
                    title: task.title,
                    description: task.description ?? '',
                    dueDate: task.dueDate?.slice(0, 10) ?? '',
                  });
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
