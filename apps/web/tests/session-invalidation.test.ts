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
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
});

const { establishSession } = await import('../src/features/auth/session.ts');
const { invalidateUnauthorizedSession, registerSessionInvalidator } =
  await import('../src/features/auth/session-invalidation.ts');

test('an active-session 401 invalidates once while concurrent and stale 401 responses do nothing', () => {
  let currentToken: string | null = 'first-token';
  let invalidations = 0;
  const unregister = registerSessionInvalidator(() => {
    invalidations += 1;
    currentToken = null;
  });

  assert.equal(invalidateUnauthorizedSession('first-token', currentToken), true);
  assert.equal(invalidateUnauthorizedSession('first-token', currentToken), false);
  currentToken = 'second-token';
  assert.equal(invalidateUnauthorizedSession('first-token', currentToken), false);
  assert.equal(invalidations, 1);
  unregister();
});

test('starting a new account session clears private cache before setting the new identity', () => {
  const calls: string[] = [];
  establishSession(
    {
      clear: () => calls.push('clear'),
      setQueryData: () => calls.push('identity'),
    },
    () => calls.push('authenticated'),
    { id: 'second-user', email: 'second@example.test', createdAt: '2026-01-01' },
  );
  assert.deepEqual(calls, ['clear', 'identity', 'authenticated']);
});
