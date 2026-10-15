import assert from 'node:assert/strict';
import test from 'node:test';
import type { Server } from 'node:http';
import jwt from 'jsonwebtoken';

process.env.DATABASE_URL = 'file:C:/tmp/wedding-planner-api-test.db';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.FRONTEND_ORIGIN = 'http://localhost:5173';

const { app } = await import('../src/app.js');
let server: Server;
let baseUrl: string;

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
  });
  const body = response.status === 204 ? undefined : await response.json();
  return { response, body };
}

function expectError(result: Awaited<ReturnType<typeof request>>, status: number, code: string) {
  assert.equal(result.response.status, status);
  assert.deepEqual(Object.keys(result.body), ['error']);
  assert.equal(result.body.error.code, code);
  assert.equal(typeof result.body.error.message, 'string');
}

async function register(email: string) {
  const result = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'password123' }),
  });
  assert.equal(result.response.status, 201);
  return { ...result.body, auth: { authorization: `Bearer ${result.body.token as string}` } };
}

test.before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}`;
});
test.after(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    ),
);

test('health, authentication, and standard error responses', async () => {
  const health = await request('/api/health');
  assert.equal(health.response.status, 200);
  assert.deepEqual(health.body, { status: 'ok' });

  expectError(await request('/api/wedding'), 401, 'UNAUTHENTICATED');
  expectError(
    await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'bad', password: 'short' }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'strict@example.test',
        password: 'password123',
        role: 'admin',
      }),
    }),
    400,
    'VALIDATION_ERROR',
  );

  const first = await register('one@example.test');
  assert.equal(first.user.passwordHash, undefined);
  expectError(
    await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'one@example.test', password: 'password123' }),
    }),
    409,
    'DUPLICATE_ACCOUNT',
  );
  expectError(
    await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'one@example.test', password: 'wrong-password' }),
    }),
    401,
    'INVALID_CREDENTIALS',
  );
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'one@example.test', password: 'password123' }),
  });
  assert.equal(login.response.status, 200);
  const me = await request('/api/auth/me', { headers: first.auth });
  assert.equal(me.response.status, 200);
  assert.equal(me.body.user.email, 'one@example.test');

  expectError(
    await request('/api/auth/me', { headers: { authorization: 'Bearer invalid' } }),
    401,
    'UNAUTHENTICATED',
  );
  const expired = jwt.sign({ sub: first.user.id }, process.env.JWT_SECRET!, { expiresIn: -1 });
  expectError(
    await request('/api/auth/me', { headers: { authorization: `Bearer ${expired}` } }),
    401,
    'UNAUTHENTICATED',
  );
});

test('wedding settings and all resource CRUD operations validate inputs', async () => {
  const account = await register('crud@example.test');
  const { auth } = account;

  const wedding = await request('/api/wedding', { headers: auth });
  assert.equal(wedding.response.status, 200);
  const weddingUpdate = await request('/api/wedding', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({
      groomName: 'Alex',
      brideName: 'Blair',
      date: '2028-02-29',
      budget: '1000.50',
    }),
  });
  assert.equal(weddingUpdate.response.status, 200);
  assert.equal(weddingUpdate.body.budget, 1000.5);
  assert.match(weddingUpdate.body.date, /^2028-02-29T00:00:00\.000Z$/);
  for (const invalidBudget of [null, '', '   ', true, [], {}, 'Infinity']) {
    expectError(
      await request('/api/wedding', {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({
          groomName: 'Alex',
          brideName: 'Blair',
          date: '2028-01-01',
          budget: invalidBudget,
        }),
      }),
      400,
      'VALIDATION_ERROR',
    );
  }
  expectError(
    await request('/api/wedding', {
      method: 'PUT',
      headers: auth,
      body: JSON.stringify({
        groomName: 'Alex',
        brideName: 'Blair',
        date: '2028-02-30',
        budget: 1,
      }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/wedding', {
      method: 'PUT',
      headers: auth,
      body: JSON.stringify({ groomName: 'Alex', brideName: 'Blair', date: null, budget: 1 }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/wedding', {
      method: 'PUT',
      headers: auth,
      body: JSON.stringify({
        groomName: 'x'.repeat(101),
        brideName: 'Blair',
        date: '2028-01-01',
        budget: 1,
      }),
    }),
    400,
    'VALIDATION_ERROR',
  );

  const guest = await request('/api/guests', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Guest',
      email: 'guest@example.test',
      attendance: 'ATTENDING',
      accompanyingGuests: '2',
    }),
  });
  assert.equal(guest.response.status, 201);
  assert.equal((await request('/api/guests', { headers: auth })).body.length, 1);
  assert.equal(
    (await request(`/api/guests/${guest.body.id}`, { headers: auth })).body.name,
    'Guest',
  );
  assert.equal(
    (
      await request(`/api/guests/${guest.body.id}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ accompanyingGuests: 3 }),
      })
    ).body.accompanyingGuests,
    3,
  );
  expectError(await request('/api/guests/not-a-cuid', { headers: auth }), 400, 'VALIDATION_ERROR');
  expectError(
    await request(`/api/guests/${guest.body.id}`, {
      method: 'PUT',
      headers: auth,
      body: '{}',
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/guests', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'Guest', accompanyingGuests: false }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/guests', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'Guest', unexpected: true }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/guests', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'x'.repeat(121) }),
    }),
    400,
    'VALIDATION_ERROR',
  );

  const budget = await request('/api/budget', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ name: 'Venue', category: 'Venue', actualCost: '450' }),
  });
  assert.equal(budget.response.status, 201);
  assert.equal((await request('/api/budget', { headers: auth })).body.length, 1);
  assert.equal(
    (await request(`/api/budget/${budget.body.id}`, { headers: auth })).body.name,
    'Venue',
  );
  assert.equal(
    (
      await request(`/api/budget/${budget.body.id}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ actualCost: 500 }),
      })
    ).body.actualCost,
    500,
  );
  const budgetAlias = await request('/api/budget-items', { headers: auth });
  assert.equal(budgetAlias.response.status, 200);
  assert.equal(budgetAlias.body[0].id, budget.body.id);
  const nullableBudget = await request('/api/budget', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ name: 'Venue', category: 'Venue', actualCost: null }),
  });
  assert.equal(nullableBudget.response.status, 201);
  assert.equal(nullableBudget.body.actualCost, null);
  expectError(
    await request('/api/budget', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'Venue', category: 'Venue', estimatedCost: true }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/budget', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'x'.repeat(121), category: 'Venue' }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/budget', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'Venue', category: 'x'.repeat(81) }),
    }),
    400,
    'VALIDATION_ERROR',
  );

  const task = await request('/api/tasks', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      title: 'Book venue',
      description: 'Call supplier',
      dueDate: '2028-01-02',
    }),
  });
  assert.equal(task.response.status, 201);
  assert.equal((await request('/api/tasks', { headers: auth })).body.length, 1);
  assert.equal(
    (await request(`/api/tasks/${task.body.id}`, { headers: auth })).body.title,
    'Book venue',
  );
  assert.equal(
    (
      await request(`/api/tasks/${task.body.id}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ completed: true, dueDate: null }),
      })
    ).body.completed,
    true,
  );
  expectError(
    await request('/api/tasks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ title: 'Task', dueDate: 0 }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/tasks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ title: 'Task', description: 'x'.repeat(2_001) }),
    }),
    400,
    'VALIDATION_ERROR',
  );
  expectError(
    await request('/api/tasks', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ title: 'x'.repeat(161) }),
    }),
    400,
    'VALIDATION_ERROR',
  );

  for (const [path, id] of [
    ['/api/guests', guest.body.id],
    ['/api/budget', budget.body.id],
    ['/api/tasks', task.body.id],
  ] as const) {
    const deleted = await request(`${path}/${id}`, { method: 'DELETE', headers: auth });
    assert.equal(deleted.response.status, 204);
  }
});

test('tenant isolation rejects every cross-user get, update, and delete', async () => {
  const first = await register('owner@example.test');
  const second = await register('other@example.test');
  const guest = await request('/api/guests', {
    method: 'POST',
    headers: first.auth,
    body: JSON.stringify({ name: 'Guest' }),
  });
  const budget = await request('/api/budget', {
    method: 'POST',
    headers: first.auth,
    body: JSON.stringify({ name: 'Venue', category: 'Venue' }),
  });
  const task = await request('/api/tasks', {
    method: 'POST',
    headers: first.auth,
    body: JSON.stringify({ title: 'Task' }),
  });
  const resources = [
    ['/api/guests', guest.body.id, { name: 'Changed' }],
    ['/api/budget', budget.body.id, { name: 'Changed' }],
    ['/api/tasks', task.body.id, { title: 'Changed' }],
  ] as const;
  for (const [path, id, update] of resources) {
    expectError(await request(`${path}/${id}`, { headers: second.auth }), 404, 'NOT_FOUND');
    expectError(
      await request(`${path}/${id}`, {
        method: 'PUT',
        headers: second.auth,
        body: JSON.stringify(update),
      }),
      404,
      'NOT_FOUND',
    );
    expectError(
      await request(`${path}/${id}`, { method: 'DELETE', headers: second.auth }),
      404,
      'NOT_FOUND',
    );
  }
  assert.equal(
    (await request('/api/wedding', { headers: second.auth })).body.userId,
    second.user.id,
  );
});

test('invalid JSON, unknown routes, unsupported methods, and OPTIONS use API-safe responses', async () => {
  const account = await register('routing@example.test');
  expectError(
    await request('/api/guests', { method: 'POST', headers: account.auth, body: '{' }),
    400,
    'INVALID_JSON',
  );
  expectError(await request('/api/does-not-exist', { headers: account.auth }), 404, 'NOT_FOUND');
  expectError(await request('/api', { headers: account.auth }), 404, 'NOT_FOUND');
  const unsupported = await request('/api/guests', { method: 'PATCH', headers: account.auth });
  expectError(unsupported, 405, 'METHOD_NOT_ALLOWED');
  assert.equal(unsupported.response.headers.get('allow'), 'GET, HEAD, POST');
  const options = await request('/api/guests', { method: 'OPTIONS' });
  assert.equal(options.response.status, 204);
});
