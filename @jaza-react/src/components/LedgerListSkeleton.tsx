'use client';

import type { CSSProperties } from 'react';
import { Skeleton } from './Skeleton.js';
import type { JazaTheme } from '../theme/tokens.js';

type LedgerListSkeletonProps = {
  theme: JazaTheme;
  mode?: 'preview' | 'scroll';
  rows?: number;
  style?: CSSProperties;
  accessibilityLabel?: string;
};

function LedgerRowSkeleton({ theme }: { theme: JazaTheme }) {
  const { spacing } = theme;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${spacing.md}px ${spacing.md}px`,
        gap: spacing.md,
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton theme={theme} width="55%" height={16} borderRadius={6} />
        <Skeleton theme={theme} width="40%" height={12} borderRadius={6} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <Skeleton theme={theme} width={56} height={16} borderRadius={6} />
        <Skeleton theme={theme} width={64} height={18} borderRadius={8} />
      </div>
    </div>
  );
}

/** Shaded card placeholder matching default ledger chrome. */
export function LedgerListSkeleton({
  theme,
  mode = 'preview',
  rows,
  style,
  accessibilityLabel = 'Loading transactions',
}: LedgerListSkeletonProps) {
  const { colors, spacing, radius } = theme;
  const count = rows ?? (mode === 'preview' ? 3 : 5);

  const cardStyle: CSSProperties = {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    overflow: 'hidden',
  };

  const divider = (
    <div
      style={{
        height: 1,
        backgroundColor: colors.outlineVariant,
        margin: `0 ${spacing.md}px`,
      }}
    />
  );

  if (mode === 'preview') {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, ...style }}
        role="status"
        aria-label={accessibilityLabel}
      >
        <div style={cardStyle}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i}>
              <LedgerRowSkeleton theme={theme} />
              {i < count - 1 ? divider : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, ...style }}
      role="status"
      aria-label={accessibilityLabel}
    >
      <Skeleton
        theme={theme}
        width="36%"
        height={14}
        borderRadius={6}
        style={{ marginBottom: spacing.sm }}
      />
      <div style={cardStyle}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>
            <LedgerRowSkeleton theme={theme} />
            {i < count - 1 ? divider : null}
          </div>
        ))}
      </div>
    </div>
  );
}
