'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  darkTheme,
  JazaProvider,
  lightTheme,
  type InitResult,
} from '@jazadev/react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppPrefsProvider, useAppPrefs } from '@/lib/app-prefs';
import { apiFetch } from '@/lib/api';

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading, signOut, setAuthError } = useAuth();
  const { themePreference, locale } = useAppPrefs();
  const pathname = usePathname();
  const router = useRouter();
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemScheme(mq.matches ? 'dark' : 'light');
    const onChange = () => setSystemScheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedMode =
    themePreference === 'system' ? systemScheme : themePreference;
  const chrome = resolvedMode === 'dark' ? darkTheme : lightTheme;

  const onSignInRoute = pathname === '/';

  useEffect(() => {
    if (loading) return;
    if (!session && !onSignInRoute) {
      router.replace('/');
    } else if (session && onSignInRoute) {
      router.replace('/home');
    }
  }, [session, loading, onSignInRoute, router]);

  const getSession = useCallback(async (): Promise<InitResult> => {
    if (!session) throw new Error('Not signed in');
    const res = await apiFetch('/api/jaza/init', {
      method: 'POST',
      userId: session.userId,
    });
    const data = (await res.json().catch(() => ({}))) as InitResult & {
      message?: string;
    };
    if (!res.ok) {
      throw new Error(data.message ?? 'Jaza init failed');
    }
    return data;
  }, [session]);

  const onAuthError = useCallback(
    (error: Error) => {
      console.warn('[jaza] session auth failed', error.message);
      setAuthError(
        error.message ||
          'Jaza session failed. If you switched sandbox/live keys, sign in again to remint the customer.',
      );
      router.replace('/');
      void signOut();
    },
    [router, setAuthError, signOut],
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: chrome.colors.background,
          color: chrome.colors.primary,
        }}
      >
        Loading…
      </div>
    );
  }

  if (!session) {
    if (!onSignInRoute) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: chrome.colors.background,
          }}
        >
          Loading…
        </div>
      );
    }
    return <>{children}</>;
  }

  return (
    <JazaProvider
      publishableKey={process.env.NEXT_PUBLIC_JAZA_PUBLISHABLE_KEY!}
      apiBaseUrl={process.env.NEXT_PUBLIC_JAZA_API_BASE_URL}
      getSession={getSession}
      onAuthError={onAuthError}
      theme={themePreference}
      locale={locale}
    >
      {children}
    </JazaProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppPrefsProvider>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </AppPrefsProvider>
  );
}
