import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Task } from '../../lib/api';
import { Button, Field, Input, Notice, State } from '../../components/ui';
const blank = { title: '', description: '', dueDate: '' };
export function TasksPage() {
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
      setSuccess(editing ? 'Task updated.' : 'Task added.');
    },
  });
  const remove = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setSuccess('Task deleted.');
    },
  });
  const toggle = useMutation({
    mutationFn: (task: Task) => api.updateTask(task.id, { completed: !task.completed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setSuccess('Task status updated.');
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
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="mt-1 text-stone-600">Plan every detail in one place.</p>
        </div>
        <p className="text-sm text-stone-600">
          {query.data?.filter((t) => !t.completed).length ?? 0} pending
        </p>
      </div>
      <form
        onSubmit={submit}
        className="mt-6 grid gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200 md:grid-cols-3"
      >
        <Field label="Task">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </Field>
        <Field label="Description">
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Due date">
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </Field>
        <div className="md:col-span-3 flex gap-2">
          <Button disabled={save.isPending}>
            {save.isPending ? 'Saving…' : editing ? 'Save task' : 'Add task'}
          </Button>
          {editing && (
            <Button
              type="button"
              className="bg-stone-600 hover:bg-stone-500"
              onClick={() => {
                setEditing(null);
                setForm(blank);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        {save.isError && (
          <p role="alert" className="text-sm text-red-700 md:col-span-3">
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
        <ul className="mt-5 divide-y divide-stone-100 rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
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
                  <p className="mt-1 text-sm text-stone-600">{task.description}</p>
                )}
                {task.dueDate && (
                  <p className="mt-1 text-xs text-stone-500">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <button
                  className="mr-3 text-sm text-rose-800 underline"
                  onClick={() => {
                    setEditing(task);
                    setForm({
                      title: task.title,
                      description: task.description ?? '',
                      dueDate: task.dueDate?.slice(0, 10) ?? '',
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-red-700 underline"
                  onClick={() => {
                    if (confirm(`Delete ${task.title}?`)) remove.mutate(task.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
