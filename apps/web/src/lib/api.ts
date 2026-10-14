import { buildApiUrl } from './api-url';
import i18n from '../i18n';

export type User = { id: string; email: string; createdAt: string };
export type Wedding = {
  id: string;
  userId: string;
  name: string;
  groomName: string | null;
  brideName: string | null;
  date: string;
  location: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
};
export type Guest = {
  id: string;
  name: string;
  email: string | null;
  attendance: 'PENDING' | 'ATTENDING' | 'DECLINED';
  accompanyingGuests: number;
};
export type BudgetItem = {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  actualCost: number | null;
};
export type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
};

const tokenKey = 'wedding-planner-token';
export const authToken = {
  get: () => localStorage.getItem(tokenKey),
  set: (token: string) => localStorage.setItem(tokenKey, token),
  clear: () => localStorage.removeItem(tokenKey),
};
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authToken.get();
  const response = await fetch(buildApiUrl(path, import.meta.env.VITE_API_URL || '/api'), {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      { error?: { message?: string } } | undefined;
    if (response.status === 401) authToken.clear();
    throw new ApiError(response.status, body?.error?.message ?? i18n.t('api.genericError'));
  }
  return (response.status === 204 ? undefined : response.json()) as Promise<T>;
}
export const api = {
  register: (input: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: () => request<{ user: User }>('/auth/me'),
  wedding: () => request<Wedding>('/wedding'),
  updateWedding: (input: Pick<Wedding, 'groomName' | 'brideName' | 'date' | 'budget'>) =>
    request<Wedding>('/wedding', { method: 'PUT', body: JSON.stringify(input) }),
  guests: () => request<Guest[]>('/guests'),
  createGuest: (input: Omit<Guest, 'id'>) =>
    request<Guest>('/guests', { method: 'POST', body: JSON.stringify(input) }),
  updateGuest: (id: string, input: Partial<Omit<Guest, 'id'>>) =>
    request<Guest>(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteGuest: (id: string) => request<void>(`/guests/${id}`, { method: 'DELETE' }),
  budget: () => request<BudgetItem[]>('/budget'),
  createBudget: (input: Omit<BudgetItem, 'id'>) =>
    request<BudgetItem>('/budget', { method: 'POST', body: JSON.stringify(input) }),
  updateBudget: (id: string, input: Partial<Omit<BudgetItem, 'id'>>) =>
    request<BudgetItem>(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteBudget: (id: string) => request<void>(`/budget/${id}`, { method: 'DELETE' }),
  tasks: () => request<Task[]>('/tasks'),
  createTask: (input: Omit<Task, 'id'>) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  updateTask: (id: string, input: Partial<Omit<Task, 'id'>>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
};
