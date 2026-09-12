'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { clearSession, getSession, setSession } from './session';
import type { SessionUser } from './types';

type AuthContextValue = {
  session: SessionUser | null;
  loading: boolean;
  authError: string | null;
  setAuthError: (message: string | null) => void;
  signIn: (session: SessionUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await getSession();
      if (!cancelled) {
        setSessionState(stored);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (next: SessionUser) => {
    setAuthError(null);
    await setSession(next);
    setSessionState(next);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      authError,
      setAuthError,
      signIn,
      signOut,
    }),
    [session, loading, authError, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
