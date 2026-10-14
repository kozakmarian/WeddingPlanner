import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, authToken, type User } from '../../lib/api';

type AuthValue = { user: User | null; loading: boolean; logout: () => void };
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['auth', 'me'], queryFn: api.me, enabled: Boolean(authToken.get()), retry: false });
  const logout = () => { authToken.clear(); queryClient.clear(); };
  return <AuthContext.Provider value={{ user: query.data?.user ?? null, loading: Boolean(authToken.get()) && query.isLoading, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value; }
