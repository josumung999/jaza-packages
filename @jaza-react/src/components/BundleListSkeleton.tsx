'use client';

import { Skeleton } from './Skeleton.js';
import type { JazaTheme } from '../theme/tokens.js';

type BundleListSkeletonProps = {
  theme: JazaTheme;
  count?: number;
  accessibilityLabel?: string;
};

function BundleRowSkeleton({ theme }: { theme: JazaTheme }) {
  const { colors, spacing, radius } = theme;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: radius.xl,
        backgroundColor: colors.bundleBg,
        border: `1px solid ${colors.bundleBorder}`,
        marginBottom: spacing.sm,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flex: 1, marginRight: spacing.md, display: 'flex', flexDirection: 'column', gap: spacing.xs + 2 }}>
        <Skeleton theme={theme} width="72%" height={18} borderRadius={6} />
        <Skeleton theme={theme} width="48%" height={14} borderRadius={6} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: spacing.xs + 2 }}>
        <Skeleton theme={theme} width={56} height={18} borderRadius={6} />
        <Skeleton theme={theme} width={72} height={12} borderRadius={4} />
      </div>
    </div>
  );
}

/** Placeholder rows matching bundle card layout while offers load. */
export function BundleListSkeleton({
  theme,
  count = 3,
  accessibilityLabel = 'Loading bundles',
}: BundleListSkeletonProps) {
  return (
    <div role="status" aria-label={accessibilityLabel}>
      {Array.from({ length: count }, (_, index) => (
        <BundleRowSkeleton key={index} theme={theme} />
      ))}
    </div>
  );
}
