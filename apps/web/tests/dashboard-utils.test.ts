import assert from 'node:assert/strict';
import test from 'node:test';
import {
  daysUntilWedding,
  weddingDateFromValue,
} from '../src/features/dashboard/dashboard-utils.ts';

test('wedding dates are interpreted as local calendar dates without timezone shifts', () => {
  const date = weddingDateFromValue('2026-10-14T00:00:00.000Z');
  assert.equal(date?.getFullYear(), 2026);
  assert.equal(date?.getMonth(), 9);
  assert.equal(date?.getDate(), 14);
});

test('countdown handles missing, future, and past wedding dates', () => {
  const now = new Date(2026, 9, 14, 19);
  assert.equal(daysUntilWedding(undefined, now), null);
  assert.equal(daysUntilWedding('2026-10-16', now), 2);
  assert.equal(daysUntilWedding('2026-10-12', now), -2);
});
