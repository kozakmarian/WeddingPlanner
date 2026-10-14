import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApiUrl } from '../src/lib/api-url.ts';

test('buildApiUrl applies the API prefix exactly once', () => {
  assert.equal(buildApiUrl('/auth/login', 'http://localhost:3000/api'), 'http://localhost:3000/api/auth/login');
  assert.equal(buildApiUrl('/guests'), '/api/guests');
  assert.equal(buildApiUrl('tasks', '/api/'), '/api/tasks');
});
