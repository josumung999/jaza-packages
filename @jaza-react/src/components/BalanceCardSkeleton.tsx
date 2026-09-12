'use client';

import type { CSSProperties } from 'react';
import { Skeleton } from './Skeleton.js';
import type { JazaTheme } from '../theme/tokens.js';

type BalanceCardSkeletonProps = {
  theme: JazaTheme;
  style?: CSSProperties;
  accessibilityLabel?: string;
};

/** Full balance card placeholder while credits load. */
export function BalanceCardSkeleton({
  theme,
  style,
  accessibilityLabel = 'Loading balance',
}: BalanceCardSkeletonProps) {
  const { colors, spacing, radius } = theme;

  return (
    <div
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: radius.xl,
        padding: spacing.md,
        ...style,
      }}
      role="status"
      aria-label={accessibilityLabel}
    >
      <Skeleton
        theme={theme}
        width="42%"
        height={14}
        borderRadius={6}
        style={{ marginBottom: spacing.xs }}
      />
      <div className="jaza-row" style={{ gap: spacing.sm }}>
        <Skeleton theme={theme} width={28} height={28} borderRadius={14} />
        <Skeleton
          theme={theme}
          height={48}
          borderRadius={10}
          style={{ flex: 1, maxWidth: 180 }}
        />
      </div>
    </div>
  );
}
