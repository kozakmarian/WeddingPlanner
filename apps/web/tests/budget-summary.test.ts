import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateBudgetSummary } from '../src/features/budget/budget-summary.ts';

test('calculateBudgetSummary handles empty, zero, negative, and decimal budgets safely', () => {
  assert.deepEqual(calculateBudgetSummary(0, []), { spent: 0, remaining: 0 });
  assert.deepEqual(
    calculateBudgetSummary(100, [
      { id: '1', name: 'Venue', category: 'Venue', estimatedCost: 25, actualCost: 40.1 },
      { id: '2', name: 'Flowers', category: 'Flowers', estimatedCost: 25, actualCost: 60.2 },
      { id: '3', name: 'Music', category: 'Music', estimatedCost: 25, actualCost: null },
    ]),
    { spent: 100.3, remaining: -0.3 },
  );
});
