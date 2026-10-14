import type { QueryClient } from '@tanstack/react-query';
import { authToken, type User } from '../../lib/api';
import { endAuthenticatedSession } from './auth-session';

export function clearSession(
  queryClient: Pick<QueryClient, 'clear'>,
  setAuthenticated: (value: boolean) => void,
) {
  endAuthenticatedSession({
    clearToken: authToken.clear,
    setAuthenticated,
    clearQueryCache: () => queryClient.clear(),
  });
}

export function establishSession(
  queryClient: Pick<QueryClient, 'setQueryData'>,
  setAuthenticated: (value: boolean) => void,
  user: User,
) {
  queryClient.setQueryData(['auth', 'me'], { user });
  setAuthenticated(true);
}
