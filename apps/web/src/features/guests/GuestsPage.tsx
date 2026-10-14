import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Guest } from '../../lib/api';
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
const blank = {
  name: '',
  email: '',
  attendance: 'PENDING' as Guest['attendance'],
  accompanyingGuests: '0',
};
const tone = { ATTENDING: 'success', PENDING: 'warning', DECLINED: 'error' } as const;
export function GuestsPage() {
  const q = useQuery({ queryKey: ['guests'], queryFn: api.guests });
  const qc = useQueryClient();
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState<Guest | null>(null);
  const [success, setSuccess] = useState('');
  const save = useMutation({
    mutationFn: (x: Omit<Guest, 'id'>) => (edit ? api.updateGuest(edit.id, x) : api.createGuest(x)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guests'] });
      setF(blank);
      setEdit(null);
      setSuccess('Guest saved.');
    },
  });
  const del = useMutation({
    mutationFn: api.deleteGuest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guests'] });
      setSuccess('Guest deleted.');
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
    setF({
      name: g.name,
      email: g.email ?? '',
      attendance: g.attendance,
      accompanyingGuests: String(g.accompanyingGuests),
    });
  }
  if (q.isLoading) return <State>Loading guests…</State>;
  if (q.isError)
    return (
      <State>
        Could not load guests.{' '}
        <button className="underline" onClick={() => q.refetch()}>
          Try again
        </button>
      </State>
    );
  return (
    <section>
      <PageHeader eyebrow="Your people" title="Guests">
        <p className="text-sm text-[var(--text-muted)]">{q.data!.length} invited</p>
      </PageHeader>
      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-4">
          <Field label="Name">
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Field>
          <Field label="Attendance">
            <Select
              value={f.attendance}
              onChange={(e) => setF({ ...f, attendance: e.target.value as Guest['attendance'] })}
            >
              <option value="PENDING">Pending</option>
              <option value="ATTENDING">Attending</option>
              <option value="DECLINED">Declined</option>
            </Select>
          </Field>
          <Field label="Plus ones">
            <Input
              type="number"
              min="0"
              value={f.accompanyingGuests}
              onChange={(e) => setF({ ...f, accompanyingGuests: e.target.value })}
            />
          </Field>
          <div className="flex gap-2 md:col-span-4">
            <Button disabled={save.isPending}>{edit ? 'Save guest' : 'Add guest'}</Button>
            {edit && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEdit(null);
                  setF(blank);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
      {success && (
        <div className="mt-4">
          <Notice>{success}</Notice>
        </div>
      )}
      <div className="mt-5 grid gap-3">
        {q.data!.length === 0 ? (
          <State>No guests yet. Add the first person above.</State>
        ) : (
          q.data!.map((g) => (
            <Card key={g.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="min-w-40 flex-1">
                <p className="font-bold">{g.name}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {g.email ?? 'No email provided'} · {g.accompanyingGuests} plus ones
                </p>
              </div>
              <Badge tone={tone[g.attendance]}>{g.attendance.toLowerCase()}</Badge>
              <button className="font-bold text-[var(--primary-dark)]" onClick={() => start(g)}>
                Edit
              </button>
              <button
                className="font-bold text-[var(--error)]"
                disabled={del.isPending}
                onClick={() => {
                  if (confirm(`Delete ${g.name}?`)) del.mutate(g.id);
                }}
              >
                Delete
              </button>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
