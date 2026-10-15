import { buildApiUrl } from './api-url';
import i18n from '../i18n';
import { invalidateUnauthorizedSession } from '../features/auth/session-invalidation';

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
export type BudgetItemInput = Omit<BudgetItem, 'id' | 'estimatedCost'> & {
  estimatedCost?: number;
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
    message: string = apiErrorMessage(status),
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export function apiErrorMessage(status: number, network = false) {
  if (network) return i18n.t('api.networkError');
  if (status === 400) return i18n.t('api.validationError');
  if (status === 401) return i18n.t('api.unauthorized');
  if (status === 403) return i18n.t('api.forbidden');
  if (status === 404) return i18n.t('api.notFound');
  if (status === 409) return i18n.t('api.conflict');
  if (status >= 500) return i18n.t('api.serverError');
  return i18n.t('api.genericError');
}

export function fieldErrors(error: unknown) {
  return error instanceof ApiError ? error.fieldErrors : {};
}

async function errorFromResponse(response: Response) {
  const body = (await response.json().catch(() => undefined)) as
    { error?: { details?: { fieldErrors?: Record<string, string[]> } } } | undefined;
  return new ApiError(
    response.status,
    apiErrorMessage(response.status),
    body?.error?.details?.fieldErrors ?? {},
  );
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  { invalidateOnUnauthorized = true }: { invalidateOnUnauthorized?: boolean } = {},
): Promise<T> {
  const token = authToken.get();
  let response: Response;
  try {
    response = await fetch(buildApiUrl(path, import.meta.env.VITE_API_URL || '/api'), {
      ...options,
      headers: {
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, apiErrorMessage(0, true));
  }
  if (!response.ok) {
    const error = await errorFromResponse(response);
    if (response.status === 401 && invalidateOnUnauthorized)
      invalidateUnauthorizedSession(token, authToken.get());
    throw error;
  }
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(0, i18n.t('api.invalidResponse'));
  }
}
export const api = {
  register: (input: { email: string; password: string }) =>
    request<{ user: User; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      { invalidateOnUnauthorized: false },
    ),
  login: (input: { email: string; password: string }) =>
    request<{ user: User; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      { invalidateOnUnauthorized: false },
    ),
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
  createBudget: (input: BudgetItemInput) =>
    request<BudgetItem>('/budget', { method: 'POST', body: JSON.stringify(input) }),
  updateBudget: (id: string, input: Partial<BudgetItemInput>) =>
    request<BudgetItem>(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteBudget: (id: string) => request<void>(`/budget/${id}`, { method: 'DELETE' }),
  tasks: () => request<Task[]>('/tasks'),
  createTask: (input: Omit<Task, 'id'>) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  updateTask: (id: string, input: Partial<Omit<Task, 'id'>>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
};
