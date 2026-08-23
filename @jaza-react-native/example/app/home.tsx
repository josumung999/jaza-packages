import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { JazaBalanceWidget, JazaTopUpButton } from '@jazadev/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!session) {
    return null;
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello</Text>
          <Text style={styles.email}>{session.email}</Text>
        </View>
        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
          style={styles.signOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Your balance</Text>
      <JazaBalanceWidget />

      <Text style={[styles.section, { marginTop: 24 }]}>Top up</Text>
      <JazaTopUpButton
        label="Buy credit bundles"
        onRequestToken={async () => {
          const res = await apiFetch('/api/jaza/top-up-token', {
            method: 'POST',
            userId: session.userId,
          });
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
            token?: string;
          };
          if (!res.ok || !data.token?.trim()) {
            const message = data.message ?? `Could not start top-up (${res.status})`;
            Alert.alert('Top up failed', message);
            throw new Error(message);
          }
          return data.token;
        }}
      />

      <Text style={styles.hint}>
        Customer ID: {session.customerId}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hello: {
    fontSize: 14,
    color: '#64748b',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  signOut: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  signOutText: {
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  hint: {
    marginTop: 'auto',
    fontSize: 12,
    color: '#94a3b8',
  },
});
