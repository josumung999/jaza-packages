import { Stack, usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, type ReactNode } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  darkTheme,
  JazaProvider,
  lightTheme,
  type InitResult,
} from '@jazadev/react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppPrefsProvider, useAppPrefs } from '@/lib/app-prefs';
import { apiFetch } from '@/lib/api';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading, signOut, setAuthError } = useAuth();
  const { themePreference, locale } = useAppPrefs();
  const pathname = usePathname();
  const router = useRouter();
  const systemScheme = useColorScheme();
  const resolvedMode =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;
  const chrome = resolvedMode === 'dark' ? darkTheme : lightTheme;

  const onSignInRoute = pathname === '/' || pathname === '/index';

  useEffect(() => {
    if (loading) return;

    if (!session && !onSignInRoute) {
      router.replace('/');
    } else if (session && onSignInRoute) {
      router.replace('/home');
    }
  }, [session, loading, onSignInRoute, pathname, router]);

  const getSession = useCallback(async (): Promise<InitResult> => {
    if (!session) throw new Error('Not signed in');
    const res = await apiFetch('/api/jaza/init', {
      method: 'POST',
      userId: session.userId,
    });
    const data = (await res.json().catch(() => ({}))) as InitResult & {
      message?: string;
      code?: string;
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
      // Navigate first so /home (useJaza) is not left mounted without JazaProvider.
      router.replace('/');
      void signOut();
    },
    [router, setAuthError, signOut],
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: chrome.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={chrome.colors.primary} />
      </View>
    );
  }

  // Avoid rendering screens that call useJaza after session clear but before redirect.
  if (!session) {
    if (!onSignInRoute) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chrome.colors.background,
          }}
        >
          <ActivityIndicator size="large" color={chrome.colors.primary} />
        </View>
      );
    }
    return <>{children}</>;
  }

  return (
    <JazaProvider
      publishableKey={process.env.EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY!}
      apiBaseUrl={process.env.EXPO_PUBLIC_JAZA_API_BASE_URL}
      getSession={getSession}
      onAuthError={onAuthError}
      theme={themePreference}
      locale={locale}
    >
      {children}
    </JazaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppPrefsProvider>
        <AuthProvider>
          <AuthGate>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="home" />
              <Stack.Screen name="transactions" />
            </Stack>
          </AuthGate>
        </AuthProvider>
      </AppPrefsProvider>
    </GestureHandlerRootView>
  );
}
