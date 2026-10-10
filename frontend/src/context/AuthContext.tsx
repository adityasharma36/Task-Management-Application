
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authApi } from '../api/auth';
import { api, setAccessToken } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const token = await authApi.refresh();

        if (!active || !token) return;

        const response = await api.get('/users/me');

        const profile =
          response.data?.data ??
          response.data?.user ??
          response.data;

        if (active && profile?.id) {
          setUser(profile as User);
        }
      } catch {
        setAccessToken(null);

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);

      setUser(result.user);
    },
    [],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      // Create the account without authenticating the user.
      await authApi.register(name, email, password);

      // Do not call setUser() here.
      // The user must log in separately.
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading, signIn, signUp, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
