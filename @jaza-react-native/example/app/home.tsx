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
  type JazaLocale,
  type ThemePreference,
} from '@jazadev/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { useAppPrefs } from '@/lib/app-prefs';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'expo-router';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];
const LOCALE_OPTIONS: JazaLocale[] = ['en', 'fr', 'sw', 'ln'];

function SessionDebug() {
  const { status, balanceCredits, theme } = useJaza();
  return (
    <Text style={{ fontSize: 12, color: theme.colors.primary, fontFamily: 'monospace' }}>
      Jaza status: {status} · balanceCredits: {balanceCredits ?? '—'}
    </Text>
  );
}

function PrefsControls() {
  const { theme, setLocale: setSdkLocale } = useJaza();
  const {
    themePreference,
    setThemePreference,
    locale,
    setLocale,
  } = useAppPrefs();
  const { colors, spacing, radius } = theme;

  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        Theme
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {THEME_OPTIONS.map((option) => {
          const selected = themePreference === option;
          return (
            <Pressable
              key={option}
              onPress={() => setThemePreference(option)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radius.full,
                backgroundColor: selected
                  ? colors.primaryContainer
                  : colors.surfaceContainerHigh,
              }}
            >
              <Text
                style={{
                  color: selected
                    ? colors.onPrimaryContainer
                    : colors.onSurface,
                  fontWeight: '600',
                  fontSize: 13,
                  textTransform: 'capitalize',
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: spacing.sm,
        }}
      >
        Locale
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {LOCALE_OPTIONS.map((option) => {
          const selected = locale === option;
          return (
            <Pressable
              key={option}
              onPress={() => {
                setLocale(option);
                setSdkLocale(option);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radius.full,
                backgroundColor: selected
                  ? colors.primaryContainer
                  : colors.surfaceContainerHigh,
              }}
            >
              <Text
                style={{
                  color: selected
                    ? colors.onPrimaryContainer
                    : colors.onSurface,
                  fontWeight: '600',
                  fontSize: 13,
                  textTransform: 'uppercase',
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ActionsSection({ userId }: { userId: string }) {
  const { features, notifyWalletChanged, theme } = useJaza();
  const { colors } = theme;

  if (features.length === 0) {
    return (
      <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>
        No features configured in the dashboard yet.
      </Text>
    );
  }

  return (
    <View style={{ gap: 10 }}>
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
  const { theme } = useJaza();
  const { colors, spacing } = theme;

  if (!session) {
    return null;
  }

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.onSurfaceVariant,
    },
    email: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.onSurface,
    },
    signOut: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    signOutText: {
      color: colors.onSurfaceVariant,
      fontWeight: '500',
    },
    section: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
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
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    hint: {
      marginTop: 24,
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
  });

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
      <PrefsControls />

      <Text style={styles.section}>Your balance</Text>
      <JazaBalance />

      <Text style={[styles.section, { marginTop: spacing.lg }]}>Top up</Text>
      <JazaTopUpButton />

      <View style={styles.ledgerHeader}>
        <Text style={styles.section}>Recent activity</Text>
        <Pressable onPress={() => router.push('/transactions')}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>
      <JazaLedger mode="preview" limit={5} />

      <Text style={[styles.section, { marginTop: spacing.lg }]}>Actions</Text>
      <ActionsSection userId={session.userId} />

      <Text style={styles.hint}>Customer ID: {session.customerId}</Text>
    </ScrollView>
  );
}
