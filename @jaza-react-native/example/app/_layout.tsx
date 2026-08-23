import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { JazaProvider } from '@jazadev/react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const onSignIn = pathname === '/' || pathname === '/index';

    if (!session && !onSignIn) {
      router.replace('/');
    } else if (session && onSignIn) {
      router.replace('/home');
    }
  }, [session, loading, pathname, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <>{children}</>;
  }

  return (
    <JazaProvider
      publishableKey={process.env.EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY!}
      apiBaseUrl={process.env.EXPO_PUBLIC_JAZA_API_BASE_URL}
      getBalance={async () => {
        const res = await apiFetch('/api/jaza/balance', {
          userId: session.userId,
        });
        if (!res.ok) {
          throw new Error('Failed to load balance');
        }
        const data = (await res.json()) as { balanceCredits: number };
        return data.balanceCredits;
      }}
      onTopUpComplete={() => {
        // Balance widget refreshes via provider
      }}
      theme="system"
    >
      {children}
    </JazaProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <AuthGate>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="home" />
            </Stack>
          </AuthGate>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
