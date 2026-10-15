import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isFormDirty, shouldWarnBeforeLeaving } from '../../lib/form-state';

export function useUnsavedChanges<T>(value: T) {
  const { t } = useTranslation();
  const [baseline, setBaseline] = useState(() => value);
  const dirty = isFormDirty(value, baseline);
  const blocker = useBlocker(shouldWarnBeforeLeaving(dirty));

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(t('common.unsavedChangesConfirm'))) blocker.proceed();
    else blocker.reset();
  }, [blocker, t]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return { dirty, markClean: (nextValue: T) => setBaseline(nextValue) };
}
