'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { darkTheme, lightTheme } from '@jazadev/react';
import { useAuth } from '@/lib/auth-context';
import { useAppPrefs } from '@/lib/app-prefs';
import { apiFetch } from '@/lib/api';

export default function SignInPage() {
  const { signIn, authError, setAuthError } = useAuth();
  const router = useRouter();
  const { themePreference } = useAppPrefs();
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const mode =
    themePreference === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : themePreference;
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const { colors, spacing, radius } = theme;

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: colors.background,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: colors.surfaceContainer,
          borderRadius: radius.xl,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.onSurface }}>
          Jaza
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: colors.onSurface }}>
          Sample sign-in
        </div>
        <p
          style={{
            fontSize: 14,
            color: colors.onSurfaceVariant,
            lineHeight: 1.4,
            margin: '0 0 12px',
          }}
        >
          Email and phone are stored in <code>data/users.json</code> and create
          a Jaza customer on first use. Switching sandbox ↔ live keys remints
          for the current environment.
        </p>

        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.onSurfaceVariant,
          }}
        >
          Email
        </label>
        <input
          autoCapitalize="none"
          autoCorrect="off"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          style={{
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 16,
            color: colors.onSurface,
            background: colors.surface,
          }}
        />

        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.onSurfaceVariant,
            marginTop: 4,
          }}
        >
          Phone
        </label>
        <input
          type="tel"
          placeholder="+243…"
          value={phoneNumber}
          onChange={(ev) => setPhoneNumber(ev.target.value)}
          style={{
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 16,
            color: colors.onSurface,
            background: colors.surface,
          }}
        />

        {authError ? (
          <p style={{ color: colors.error, margin: 0 }}>{authError}</p>
        ) : null}
        {error ? (
          <p style={{ color: colors.error, margin: 0 }}>{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: spacing.md,
            background: colors.primaryContainer,
            color: colors.onPrimaryContainer,
            border: 'none',
            borderRadius: 10,
            padding: '14px 0',
            fontSize: 16,
            fontWeight: 600,
            cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Continuing…' : 'Continue'}
        </button>
      </form>
    </main>
  );
}
