export function endAuthenticatedSession({
  clearToken,
  setAuthenticated,
  clearQueryCache,
}: {
  clearToken: () => void;
  setAuthenticated: (value: boolean) => void;
  clearQueryCache: () => void;
}) {
  clearToken();
  setAuthenticated(false);
  clearQueryCache();
}
