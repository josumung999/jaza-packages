'use client';

import {
  JazaActionButton,
  JazaBalance,
  JazaLedger,
  JazaProvider,
  JazaTopUpButton,
  type InitResult,
} from '@jazadev/react';

/**
 * Demo shell — replace getSession with your real BFF.
 * Without keys, widgets stay in an unauthenticated / empty state.
 */
async function demoGetSession(): Promise<InitResult> {
  const res = await fetch('/api/jaza/init', { method: 'POST' });
  if (!res.ok) {
    throw new Error(
      'Wire POST /api/jaza/init (or replace getSession). See README.',
    );
  }
  return (await res.json()) as InitResult;
}

export function App() {
  const publishableKey =
    import.meta.env.VITE_JAZA_PUBLISHABLE_KEY ?? 'jz_test_pk_demo';

  return (
    <JazaProvider
      publishableKey={publishableKey}
      apiBaseUrl={import.meta.env.VITE_JAZA_API_BASE_URL}
      getSession={demoGetSession}
      onAuthError={(error) => console.warn('[jaza]', error.message)}
      theme="system"
    >
      <main
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0 }}>Jaza React</h1>
        <p style={{ margin: 0, opacity: 0.7 }}>
          Balance, top-up drawer (bottom on mobile / right on desktop), ledger,
          and gated actions.
        </p>
        <JazaBalance />
        <JazaTopUpButton />
        <JazaActionButton
          featureCode="SEND_MESSAGE"
          label="Send message"
          onPress={async () => {
            console.log('Host consume via your BFF');
          }}
        />
        <JazaLedger mode="preview" limit={5} />
      </main>
    </JazaProvider>
  );
}
