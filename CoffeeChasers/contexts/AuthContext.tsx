import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  devBypass?: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from secure storage on startup
  useEffect(() => {
    async function loadSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          apiService.setToken(storedToken);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch {
        // Clear any corrupted stored data
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        await SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const persistSession = useCallback(async (response: { token: string; user: User }) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, response.token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
    ]);
    apiService.setToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await apiService.login(credentials);
    await persistSession(response);
  }, [persistSession]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const response = await apiService.register(credentials);
    await persistSession(response);
  }, [persistSession]);

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {}),
      SecureStore.deleteItemAsync(USER_KEY).catch(() => {}),
    ]);
    apiService.setToken(null);
    setToken(null);
    setUser(null);
  }, []);

  // DEV ONLY — bypasses API auth so UI work can proceed without a backend
  const devBypass = __DEV__
    ? () => {
        const mockToken = 'dev-bypass-token';
        const mockUser: User = { id: 'dev-user', email: 'dev@local', name: 'Dev User' };
        apiService.setToken(mockToken);
        setToken(mockToken);
        setUser(mockUser);
      }
    : undefined;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: token !== null,
        login,
        register,
        logout,
        devBypass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
