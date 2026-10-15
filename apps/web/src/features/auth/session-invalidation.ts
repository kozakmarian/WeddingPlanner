type SessionInvalidator = () => void;

let activeInvalidator: SessionInvalidator | undefined;

export function registerSessionInvalidator(invalidator: SessionInvalidator) {
  activeInvalidator = invalidator;
  return () => {
    if (activeInvalidator === invalidator) activeInvalidator = undefined;
  };
}

export function invalidateUnauthorizedSession(
  requestToken: string | null,
  currentToken: string | null,
) {
  if (!requestToken || requestToken !== currentToken) return false;
  activeInvalidator?.();
  return Boolean(activeInvalidator);
}
