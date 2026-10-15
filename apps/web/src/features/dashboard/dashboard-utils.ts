export function weddingDateFromValue(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function daysUntilWedding(value?: string | null, now = new Date()) {
  const weddingDate = weddingDateFromValue(value);
  if (!weddingDate) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((weddingDate.getTime() - today.getTime()) / 86400000);
}
