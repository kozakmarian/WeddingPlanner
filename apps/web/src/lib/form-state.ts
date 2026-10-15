export function isFormDirty<T>(current: T, baseline: T) {
  return JSON.stringify(current) !== JSON.stringify(baseline);
}

export const shouldWarnBeforeLeaving = (dirty: boolean) => dirty;
