'use client';

import { Icon } from './Icon.js';
import type { JazaTheme } from '../theme/tokens.js';

type ProcessingSpinnerProps = {
  theme: JazaTheme;
  size?: number;
};

/**
 * Ring spinner with centered lock icon (processing / polling).
 */
export function ProcessingSpinner({
  theme,
  size = 64,
}: ProcessingSpinnerProps) {
  const { colors } = theme;
  const stroke = 4;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="jaza-spin"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `${stroke}px solid ${colors.surfaceContainerHighest}`,
          borderTopColor: colors.primary,
          boxSizing: 'border-box',
        }}
      />
      <Icon name="lock" size={Math.round(size * 0.38)} color={colors.primary} />
    </div>
  );
}
