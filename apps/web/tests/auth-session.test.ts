import assert from 'node:assert/strict';
import test from 'node:test';
import { endAuthenticatedSession } from '../src/features/auth/auth-session.ts';

test('logout synchronously clears the token, identity, and all cached user data', () => {
  const calls: string[] = [];
  let authenticated = true;
  let token = 'token-for-first-user';
  let cachedGuests = ['first-user-guest'];

  endAuthenticatedSession({
    clearToken: () => {
      token = '';
      calls.push('token');
    },
    setAuthenticated: (value) => {
      authenticated = value;
      calls.push('identity');
    },
    clearQueryCache: () => {
      cachedGuests = [];
      calls.push('cache');
    },
  });

  assert.equal(token, '');
  assert.equal(authenticated, false);
  assert.deepEqual(cachedGuests, []);
  assert.deepEqual(calls, ['token', 'identity', 'cache']);
});
