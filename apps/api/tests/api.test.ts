import assert from 'node:assert/strict';
import test from 'node:test';
import type { Server } from 'node:http';

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

test('authentication, validation, wedding settings, CRUD, and tenant isolation', async () => {
  const unauthenticated = await request('/api/wedding');
  assert.equal(unauthenticated.response.status, 401);
  const invalid = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'bad', password: 'short' }),
  });
  assert.equal(invalid.response.status, 400);

  const first = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'one@example.test', password: 'password123' }),
  });
  assert.equal(first.response.status, 201);
  assert.equal(first.body.user.passwordHash, undefined);
  const duplicate = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'one@example.test', password: 'password123' }),
  });
  assert.equal(duplicate.response.status, 409);
  const failedLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'one@example.test', password: 'wrong-password' }),
  });
  assert.equal(failedLogin.response.status, 401);
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'one@example.test', password: 'password123' }),
  });
  assert.equal(login.response.status, 200);
  const token = login.body.token as string;
  const auth = { authorization: `Bearer ${token}` };
  const me = await request('/api/auth/me', { headers: auth });
  assert.equal(me.response.status, 200);
  assert.equal(me.body.user.email, 'one@example.test');

  const wedding = await request('/api/wedding', { headers: auth });
  assert.equal(wedding.response.status, 200);
  assert.equal(wedding.body.groomName, null);
  assert.equal(wedding.body.brideName, null);
  const weddingUpdate = await request('/api/wedding', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({
      groomName: 'Alex',
      brideName: 'Blair',
      date: '2028-01-02',
      budget: 1000,
    }),
  });
  assert.equal(weddingUpdate.response.status, 200);
  assert.equal(weddingUpdate.body.groomName, 'Alex');
  assert.equal(weddingUpdate.body.brideName, 'Blair');
  assert.equal(weddingUpdate.body.name, 'Alex & Blair');
  const persistedWedding = await request('/api/wedding', { headers: auth });
  assert.equal(persistedWedding.response.status, 200);
  assert.equal(persistedWedding.body.groomName, 'Alex');
  assert.equal(persistedWedding.body.brideName, 'Blair');

  const guest = await request('/api/guests', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ name: 'Guest', attendance: 'ATTENDING' }),
  });
  assert.equal(guest.response.status, 201);
  assert.equal((await request('/api/guests', { headers: auth })).body.length, 1);
  assert.equal(
    (
      await request(`/api/guests/${guest.body.id}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ accompanyingGuests: 2 }),
      })
    ).body.accompanyingGuests,
    2,
  );

  const budget = await request('/api/budget', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ name: 'Venue', category: 'Venue' }),
  });
  assert.equal(budget.response.status, 201);
  assert.equal(budget.body.estimatedCost, 0);
  assert.equal(
    (
      await request(`/api/budget/${budget.body.id}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ actualCost: 450 }),
      })
    ).body.actualCost,
    450,
  );

  const task = await request('/api/tasks', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ title: 'Book venue' }),
  });
  assert.equal(task.response.status, 201);
  assert.equal(
    (
      await request(`/api/tasks/${task.body.id}`, {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ completed: true }),
      })
    ).body.completed,
    true,
  );

  const second = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'two@example.test', password: 'password123' }),
  });
  const secondAuth = { authorization: `Bearer ${second.body.token as string}` };
  assert.equal(
    (await request(`/api/guests/${guest.body.id}`, { headers: secondAuth })).response.status,
    404,
  );
  assert.equal(
    (await request(`/api/budget/${budget.body.id}`, { method: 'DELETE', headers: secondAuth }))
      .response.status,
    404,
  );
  assert.equal(
    (await request(`/api/tasks/${task.body.id}`, { method: 'DELETE', headers: secondAuth }))
      .response.status,
    404,
  );

  assert.equal(
    (await request(`/api/guests/${guest.body.id}`, { method: 'DELETE', headers: auth })).response
      .status,
    204,
  );
  assert.equal(
    (await request(`/api/budget/${budget.body.id}`, { method: 'DELETE', headers: auth })).response
      .status,
    204,
  );
  assert.equal(
    (await request(`/api/tasks/${task.body.id}`, { method: 'DELETE', headers: auth })).response
      .status,
    204,
  );
});
