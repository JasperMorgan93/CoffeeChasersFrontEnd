import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';
import { LoginCredentials, RegisterCredentials, User, UserProfile } from '../types/auth';

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
  updateProfile: (name: string) => Promise<void>;
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

  const persistSession = useCallback(async (token: string, profile: UserProfile) => {
    const user: User = {
      id: profile.id,
      email: profile.email ?? '',
      name: profile.name ?? '',
    };
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    apiService.setToken(token);
    setToken(token);
    setUser(user);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await apiService.login(credentials);
      apiService.setToken(session.access_token);
      const profile = await apiService.getMyProfile();
      await persistSession(session.access_token, profile);
    },
    [persistSession]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const session = await apiService.register(credentials);
      apiService.setToken(session.access_token);
      const profile = await apiService.getMyProfile();
      await persistSession(session.access_token, profile);
    },
    [persistSession]
  );

  const updateProfile = useCallback(async (name: string) => {
    const profile = await apiService.updateMyProfile({ name });
    setUser((prev) => {
      if (!prev) return prev;
      const updated: User = { ...prev, name: profile.name ?? prev.name };
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

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
        const mockUser: User = { id: 0, email: 'dev@local', name: 'Dev User' };
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
        updateProfile,
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
