'use client';

import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { JazaTheme } from '../theme/tokens.js';

const MAX_DIGITS = 15;

export type PhoneDigitInputProps = {
  theme: JazaTheme;
  value: string;
  onChangeText: (value: string) => void;
  dialPressable: ReactNode;
  trailing?: ReactNode;
  countryLabel?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
};

/**
 * Glovo-style Country + Phone shaded fields.
 */
export function PhoneDigitInput({
  theme,
  value,
  onChangeText,
  dialPressable,
  trailing,
  countryLabel = 'Country',
  phoneLabel = 'Phone Number',
  phonePlaceholder = 'Enter number',
}: PhoneDigitInputProps) {
  const { colors, spacing, radius } = theme;
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.replace(/\D/g, '').slice(0, MAX_DIGITS);

  const fieldBase: CSSProperties = {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.lg,
    padding: `${spacing.sm}px ${spacing.md}px`,
    minHeight: 64,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const labelStyle: CSSProperties = {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: 500,
    marginBottom: spacing.xs,
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: spacing.sm,
        width: '100%',
      }}
    >
      <div
        style={{
          ...fieldBase,
          flexShrink: 0,
          minWidth: 100,
        }}
      >
        <div style={labelStyle}>{countryLabel}</div>
        {dialPressable}
      </div>
      <button
        type="button"
        style={{
          ...fieldBase,
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          border: focused ? `1px solid ${colors.primaryContainer}` : '1px solid transparent',
          cursor: 'text',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          padding: `${spacing.sm}px ${spacing.md}px`,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={labelStyle}>{phoneLabel}</div>
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={MAX_DIGITS}
            placeholder={phonePlaceholder}
            value={digits}
            onChange={(e) =>
              onChangeText(e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS))
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: colors.onSurface,
              fontSize: 18 * 1.15,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              padding: 0,
              margin: 0,
            }}
          />
        </div>
        {trailing}
      </button>
    </div>
  );
}
