import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, authToken, type User } from '../../lib/api';
import { clearSession, establishSession } from './session';
import { registerSessionInvalidator } from './session-invalidation';

type AuthValue = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  login: (user: User) => void;
};
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(() => Boolean(authToken.get()));
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: api.me,
    enabled: authenticated,
    retry: false,
  });
  const logout = () => clearSession(queryClient, setAuthenticated);
  const login = (user: User) => establishSession(queryClient, setAuthenticated, user);

  useEffect(() => registerSessionInvalidator(logout), [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: authenticated ? (query.data?.user ?? null) : null,
        loading: authenticated && query.isLoading,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
