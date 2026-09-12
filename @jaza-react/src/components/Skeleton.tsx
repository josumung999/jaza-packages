'use client';

import type { CSSProperties } from 'react';
import type { JazaTheme } from '../theme/tokens.js';

type SkeletonProps = {
  theme: JazaTheme;
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: CSSProperties;
  className?: string;
};

/**
 * Stripe-style pulsing placeholder block (CSS animation via `.jaza-skeleton`).
 */
export function Skeleton({
  theme,
  width = '100%',
  height,
  borderRadius = theme.radius.md,
  style,
  className,
}: SkeletonProps) {
  return (
    <div
      className={['jaza-skeleton', className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: theme.colors.skeleton,
        ...style,
      }}
      aria-hidden
    />
  );
}
