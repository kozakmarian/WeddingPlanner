import type { BudgetItem } from '../../lib/api';

const toCents = (amount: number) => Math.round((amount + Number.EPSILON) * 100);

export function calculateBudgetSummary(totalBudget: number, items: BudgetItem[]) {
  const spentCents = items.reduce((total, item) => total + toCents(item.actualCost ?? 0), 0);
  const totalCents = toCents(totalBudget);

  return {
    spent: spentCents / 100,
    remaining: (totalCents - spentCents) / 100,
  };
}
