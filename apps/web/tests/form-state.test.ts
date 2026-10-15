import assert from 'node:assert/strict';
import test from 'node:test';
import { isFormDirty, shouldWarnBeforeLeaving } from '../src/lib/form-state.ts';

test('clean forms do not request a navigation warning', () => {
  const form = { name: 'Alex', budget: '100' };
  assert.equal(isFormDirty(form, { ...form }), false);
  assert.equal(shouldWarnBeforeLeaving(false), false);
});

test('changed forms request a navigation warning', () => {
  assert.equal(isFormDirty({ name: 'Alex', budget: '101' }, { name: 'Alex', budget: '100' }), true);
  assert.equal(shouldWarnBeforeLeaving(true), true);
});
