export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface FormSubmission {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  mobileNumber: string;
  address: string;
  feedback?: string;
  userCreated?: { _id: string; email: string; role: string } | string;
  dateCreated: string;
  userModified?: { _id: string; email: string; role: string } | string;
  dateModified?: string;
}

type TokenGetter = () => string | null;
type TokenSetter = (access: string, refresh: string) => void;
type LogoutFn = () => void;

let getAccessToken: TokenGetter = () => localStorage.getItem('accessToken');
let getRefreshToken: TokenGetter = () => localStorage.getItem('refreshToken');
let setTokens: TokenSetter = (access, refresh) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};
let onLogout: LogoutFn = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export function configureApiAuth(options: {
  getAccessToken: TokenGetter;
  getRefreshToken: TokenGetter;
  setTokens: TokenSetter;
  onLogout: LogoutFn;
}) {
  getAccessToken = options.getAccessToken;
  getRefreshToken = options.getRefreshToken;
  setTokens = options.setTokens;
  onLogout = options.onLogout;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    onLogout();
    return null;
  }

  const data = (await res.json()) as AuthResponse;
  setTokens(data.accessToken, data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.accessToken;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest<T>(path, options, false);
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Request failed');
  }

  return data as T;
}
