'use client';

import { JazaLedger, useJaza } from '@jazadev/react';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();
  const { theme } = useJaza();
  const { colors } = theme;

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '16px 20px 40px',
        background: colors.background,
        minHeight: '100vh',
      }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.onSurfaceVariant,
          fontWeight: 500,
          cursor: 'pointer',
          padding: '8px 0',
        }}
      >
        ← Back
      </button>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: colors.onSurface,
          margin: '8px 0 16px',
        }}
      >
        Transactions
      </h1>
      <div style={{ height: 'calc(100vh - 140px)' }}>
        <JazaLedger mode="scroll" style={{ height: '100%' }} />
      </div>
    </main>
  );
}
