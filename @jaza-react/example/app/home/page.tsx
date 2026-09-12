'use client';

import { useJaza } from '@jazadev/react';
import {
  JazaActionButton,
  JazaBalance,
  JazaLedger,
  JazaTopUpButton,
  type JazaLocale,
  type ThemePreference,
} from '@jazadev/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAppPrefs } from '@/lib/app-prefs';
import { apiFetch } from '@/lib/api';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];
const LOCALE_OPTIONS: JazaLocale[] = ['en', 'fr', 'sw', 'ln'];

function SessionDebug() {
  const { status, balanceCredits, theme } = useJaza();
  return (
    <p
      style={{
        fontSize: 12,
        color: theme.colors.primary,
        fontFamily: 'monospace',
        margin: 0,
      }}
    >
      Jaza status: {status} · balanceCredits: {balanceCredits ?? '—'}
    </p>
  );
}

function PrefsControls() {
  const { theme, setLocale: setSdkLocale } = useJaza();
  const { themePreference, setThemePreference, locale, setLocale } =
    useAppPrefs();
  const { colors, spacing, radius } = theme;

  return (
    <div style={{ display: 'grid', gap: spacing.sm, marginBottom: spacing.sm }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        Theme
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {THEME_OPTIONS.map((option) => {
          const selected = themePreference === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setThemePreference(option)}
              style={{
                padding: '8px 12px',
                borderRadius: radius.full,
                border: 'none',
                cursor: 'pointer',
                background: selected
                  ? colors.primaryContainer
                  : colors.surfaceContainerHigh,
                color: selected
                  ? colors.onPrimaryContainer
                  : colors.onSurface,
                fontWeight: 600,
                fontSize: 13,
                textTransform: 'capitalize',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: spacing.sm,
        }}
      >
        Locale
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {LOCALE_OPTIONS.map((option) => {
          const selected = locale === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                setLocale(option);
                setSdkLocale(option);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: radius.full,
                border: 'none',
                cursor: 'pointer',
                background: selected
                  ? colors.primaryContainer
                  : colors.surfaceContainerHigh,
                color: selected
                  ? colors.onPrimaryContainer
                  : colors.onSurface,
                fontWeight: 600,
                fontSize: 13,
                textTransform: 'uppercase',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActionsSection({ userId }: { userId: string }) {
  const { features, notifyWalletChanged, theme } = useJaza();
  const { colors } = theme;

  if (features.length === 0) {
    return (
      <p style={{ color: colors.onSurfaceVariant, fontSize: 14, margin: 0 }}>
        No features configured in the dashboard yet.
      </p>
    );
  }

  return (
    <div className="jaza-actions-row">
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
              window.alert(data.message ?? `HTTP ${res.status}`);
              throw new Error(data.message ?? `Action failed (${res.status})`);
            }
            await notifyWalletChanged();
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const { theme } = useJaza();
  const { colors, spacing } = theme;

  if (!session) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: colors.background,
      }}
    >
      <main
        style={{
          width: '100%',
          maxWidth: '56rem',
          margin: '0 auto',
          padding: '24px 20px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxSizing: 'border-box',
        }}
      >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 14, color: colors.onSurfaceVariant }}>
            Hello
          </div>
          <div
            style={{ fontSize: 18, fontWeight: 600, color: colors.onSurface }}
          >
            {session.email}
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace('/');
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.onSurfaceVariant,
            fontWeight: 500,
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          Sign out
        </button>
      </header>

      <SessionDebug />
      <PrefsControls />

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        Your balance
      </div>
      <JazaBalance />

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: spacing.lg,
        }}
      >
        Top up
      </div>
      <JazaTopUpButton />

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.onSurfaceVariant,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          Recent activity
        </div>
        <button
          type="button"
          onClick={() => router.push('/transactions')}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.primary,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          See all
        </button>
      </div>
      <JazaLedger mode="preview" limit={5} />

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: spacing.lg,
        }}
      >
        Actions
      </div>
      <ActionsSection userId={session.userId} />

      <p
        style={{
          marginTop: 24,
          fontSize: 12,
          color: colors.onSurfaceVariant,
        }}
      >
        Customer ID: {session.customerId}
      </p>
      </main>
    </div>
  );
}
