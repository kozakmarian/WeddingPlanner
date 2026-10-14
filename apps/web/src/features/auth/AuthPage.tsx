import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, authToken, type User } from '../../lib/api';
import { Button, Card, Field, Input } from '../../components/ui';
import { useAuth } from './AuthProvider';

function AuthForm({ register }: { register?: boolean }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const mutation = useMutation({
    mutationFn: register ? api.register : api.login,
    onSuccess: ({ user, token }: { user: User; token: string }) => {
      authToken.set(token);
      login(user);
      navigate((location.state as { from?: string } | null)?.from ?? '/');
    },
    onError: (e: Error) => setError(e.message),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t('auth.validEmail'));
    if (password.length < 8) return setError(t('auth.validPassword'));
    mutation.mutate({ email, password });
  };
  return (
    <main className="grid min-h-screen bg-[var(--beige-light)] lg:grid-cols-2">
      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--primary)] text-3xl text-white shadow-[var(--shadow-md)]">
              ♥
            </span>
            <p className="mt-3 font-serif text-2xl font-bold text-[var(--primary-dark)]">
              {t('brand.name')}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('brand.tagline')}</p>
          </div>
          <Card className="shadow-[var(--shadow-md)]">
            <h1 className="text-2xl font-bold text-[var(--text)]">
              {t(register ? 'auth.registerTitle' : 'auth.welcome')}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {t(register ? 'auth.registerText' : 'auth.loginText')}
            </p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <Field label={t('auth.email')}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field label={t('auth.password')}>
                <Input
                  type="password"
                  autoComplete={register ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              {error && (
                <p role="alert" className="text-sm text-[var(--error)]">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={mutation.isPending} className="mt-2 w-full">
                {mutation.isPending ? t('auth.wait') : t(register ? 'auth.register' : 'auth.login')}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              {t(register ? 'auth.already' : 'auth.new')}{' '}
              <Link
                className="font-bold text-[var(--primary-dark)] underline underline-offset-4"
                to={register ? '/login' : '/register'}
              >
                {t(register ? 'auth.login' : 'auth.createOne')}
              </Link>
            </p>
          </Card>
        </div>
      </section>
      <aside className="hidden items-center justify-center bg-[var(--beige-dark)] p-12 lg:flex">
        <img
          src="/images/wedding-rings.png"
          alt=""
          className="max-h-[70vh] max-w-full object-contain"
        />
      </aside>
    </main>
  );
}
export const LoginPage = () => <AuthForm />;
export const RegisterPage = () => <AuthForm register />;
