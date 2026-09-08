import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { darkTheme, lightTheme } from '@jazadev/react-native';
import { useAuth } from '@/lib/auth-context';
import { useAppPrefs } from '@/lib/app-prefs';
import { apiFetch } from '@/lib/api';

export default function SignInScreen() {
  const { signIn, authError, setAuthError } = useAuth();
  const router = useRouter();
  const { themePreference } = useAppPrefs();
  const systemScheme = useColorScheme();
  const mode =
    themePreference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const { colors, spacing, radius } = theme;

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setAuthError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email, phoneNumber }),
      });
      const data = (await res.json()) as {
        message?: string;
        userId?: string;
        customerId?: string;
        email?: string;
        phoneNumber?: string;
      };

      if (!res.ok || !data.userId || !data.customerId) {
        throw new Error(data.message ?? 'Sign-in failed');
      }

      await signIn({
        userId: data.userId,
        customerId: data.customerId,
        email: data.email ?? email,
        phoneNumber: data.phoneNumber ?? phoneNumber,
      });
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      padding: 24,
      gap: 8,
    },
    brand: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.onSurface,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.onSurface,
    },
    subtitle: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 12,
      lineHeight: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      marginTop: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.onSurface,
      backgroundColor: colors.surface,
    },
    error: {
      color: colors.error,
      marginTop: 4,
    },
    button: {
      marginTop: spacing.md,
      backgroundColor: colors.primaryContainer,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: colors.onPrimaryContainer,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Jaza</Text>
        <Text style={styles.title}>Sample sign-in</Text>
        <Text style={styles.subtitle}>
          Email and phone are stored locally and create a Jaza customer on first
          use. Switching sandbox ↔ live keys remints a customer for the current
          environment and overwrites the stored customer id.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="phone-pad"
          placeholder="+243…"
          placeholderTextColor={colors.onSurfaceVariant}
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {authError ? <Text style={styles.error}>{authError}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          disabled={submitting}
          onPress={onSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={colors.onPrimaryContainer} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
