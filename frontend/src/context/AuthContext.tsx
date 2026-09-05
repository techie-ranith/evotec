import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  apiRequest,
  configureApiAuth,
  type AuthResponse,
  type AuthUser,
  type UserRole,
} from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginCustomer: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  registerCustomer: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem('refreshToken')
  );

  const persistSession = useCallback((data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    configureApiAuth({
      getAccessToken: () => accessToken ?? localStorage.getItem('accessToken'),
      getRefreshToken: () => refreshToken ?? localStorage.getItem('refreshToken'),
      setTokens: (access, refresh) => {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        setAccessToken(access);
        setRefreshToken(refresh);
      },
      onLogout: logout,
    });
  }, [accessToken, refreshToken, logout]);

  const loginCustomer = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<AuthResponse>('/api/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      persistSession(data);
    },
    [persistSession]
  );

  const loginAdmin = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<AuthResponse>('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      persistSession(data);
    },
    [persistSession]
  );

  const registerCustomer = useCallback(
    async (email: string, password: string, confirmPassword: string) => {
      const data = await apiRequest<AuthResponse>('/api/auth/customer/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      persistSession(data);
    },
    [persistSession]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && accessToken),
      loginCustomer,
      loginAdmin,
      registerCustomer,
      logout,
    }),
    [user, accessToken, loginCustomer, loginAdmin, registerCustomer, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function useRequireRole(role: UserRole) {
  const { user } = useAuth();
  return user?.role === role;
}
