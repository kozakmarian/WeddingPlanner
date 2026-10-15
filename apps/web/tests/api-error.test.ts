import assert from 'node:assert/strict';
import test from 'node:test';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
});

const { ApiError, api, localizeFieldErrors, request } = await import('../src/lib/api.ts');
const { default: i18n } = await import('../src/i18n/index.ts');

test('malformed successful API responses become a safe API error', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('not json', { status: 200 });
  await assert.rejects(
    request('/guests'),
    (error: unknown) => error instanceof ApiError && error.status === 0,
  );
  globalThis.fetch = previousFetch;
});

test('network failures become a safe API error', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('offline');
  };
  await assert.rejects(
    request('/guests'),
    (error: unknown) => error instanceof ApiError && error.status === 0,
  );
  globalThis.fetch = previousFetch;
});

test('invalid login credentials do not trigger global session invalidation', async () => {
  const { registerSessionInvalidator } =
    await import('../src/features/auth/session-invalidation.ts');
  let invalidations = 0;
  const unregister = registerSessionInvalidator(() => {
    invalidations += 1;
  });
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { message: 'Nope' } }), { status: 401 });
  await assert.rejects(
    api.login({ email: 'user@example.test', password: 'password123' }),
    ApiError,
  );
  assert.equal(invalidations, 0);
  globalThis.fetch = previousFetch;
  unregister();
});

test('known field validation errors are localized in English and Slovak', async () => {
  await i18n.changeLanguage('en');
  assert.deepEqual(localizeFieldErrors({ email: ['Invalid email'] }), {
    email: ['Enter a valid email address.'],
  });

  await i18n.changeLanguage('sk');
  assert.deepEqual(localizeFieldErrors({ date: ['Expected a real calendar date.'] }), {
    date: ['Zadajte platný dátum.'],
  });
  await i18n.changeLanguage('en');
});

test('unknown field validation errors use a safe localized fallback', async () => {
  await i18n.changeLanguage('en');
  assert.deepEqual(localizeFieldErrors({ name: ['Internal parser detail: 42'] }), {
    name: ['Check this value and try again.'],
  });
});
