import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  JazaActionButton,
  JazaBalance,
  JazaLedger,
  JazaTopUpButton,
  useJaza,
} from '@jazadev/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'expo-router';

function SessionDebug() {
  const { status, balanceCredits } = useJaza();
  return (
    <Text style={styles.debug}>
      Jaza status: {status} · balanceCredits: {balanceCredits ?? '—'}
    </Text>
  );
}

function ActionsSection({ userId }: { userId: string }) {
  const { features, notifyWalletChanged } = useJaza();

  if (features.length === 0) {
    return (
      <Text style={styles.emptyActions}>
        No features configured in the dashboard yet.
      </Text>
    );
  }

  return (
    <View style={styles.actions}>
      {features.map((feature) => (
        <JazaActionButton
          key={feature.code}
          featureCode={feature.code}
          label={feature.name ?? feature.code}
          onPress={async () => {
            const res = await apiFetch('/api/jaza/actions', {
              method: 'POST',
              userId,
              body: JSON.stringify({ featureCode: feature.code }),
            });
            const data = (await res.json().catch(() => ({}))) as {
              message?: string;
              code?: string;
            };
            if (!res.ok) {
              if (data.code === 'INSUFFICIENT_CREDITS') {
                // Paywall also opens via realtime when Jaza emits insufficient.
                return;
              }
              Alert.alert('Action failed', data.message ?? `HTTP ${res.status}`);
              throw new Error(data.message ?? `Action failed (${res.status})`);
            }
            await notifyWalletChanged();
          }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!session) {
    return null;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
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

      <SessionDebug />

      <Text style={styles.section}>Your balance</Text>
      <JazaBalance />

      <Text style={[styles.section, { marginTop: 24 }]}>Top up</Text>
      <JazaTopUpButton label="Buy credit bundles" />

      <View style={styles.ledgerHeader}>
        <Text style={styles.section}>Recent activity</Text>
        <Pressable onPress={() => router.push('/transactions')}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>
      <JazaLedger mode="preview" limit={5} />

      <Text style={[styles.section, { marginTop: 24 }]}>Actions</Text>
      <ActionsSection userId={session.userId} />

      <Text style={styles.hint}>Customer ID: {session.customerId}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  root: {
    paddingHorizontal: 20,
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
  debug: {
    fontSize: 12,
    color: '#0d9488',
    fontFamily: 'monospace',
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  ledgerHeader: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    color: '#0d9488',
    fontWeight: '600',
    fontSize: 14,
  },
  actions: {
    gap: 10,
  },
  emptyActions: {
    color: '#94a3b8',
    fontSize: 14,
  },
  hint: {
    marginTop: 24,
    fontSize: 12,
    color: '#94a3b8',
  },
});
