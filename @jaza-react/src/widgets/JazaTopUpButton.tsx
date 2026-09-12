'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '../components/Icon.js';
import { t } from '../i18n/t.js';
import { useJaza } from '../provider/JazaContext.js';

export type JazaTopUpButtonRenderProps = {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  label: string;
  error: string | null;
};

export type JazaTopUpButtonProps = {
  label?: string;
  style?: CSSProperties;
  children?: (props: JazaTopUpButtonRenderProps) => ReactNode;
};

export function JazaTopUpButton({
  label,
  style,
  children,
}: JazaTopUpButtonProps) {
  const { theme, locale, openTopUp } = useJaza();
  const { colors, spacing } = theme;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayLabel = label ?? t(locale, 'topUp.defaultLabel');

  const handlePress = () => {
    void (async () => {
      setError(null);
      setLoading(true);
      try {
        await openTopUp();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t(locale, 'topUp.startError'),
        );
      } finally {
        setLoading(false);
      }
    })();
  };

  const renderProps: JazaTopUpButtonRenderProps = {
    onPress: handlePress,
    loading,
    disabled: loading,
    label: displayLabel,
    error,
  };

  if (children) {
    return <>{children(renderProps)}</>;
  }

  return (
    <div style={{ width: '100%' }}>
      <button
        type="button"
        className="jaza-btn jaza-btn-primary"
        style={style}
        onClick={handlePress}
        disabled={loading}
        aria-busy={loading}
      >
        <span className="jaza-btn-label" data-loading={loading ? 'true' : 'false'}>
          <span>{displayLabel}</span>
          <Icon
            name="arrow-forward"
            size={20}
            color={colors.onPrimaryContainer}
          />
        </span>
        {loading ? (
          <span className="jaza-btn-spinner" aria-hidden>
            <span
              className="jaza-spin"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${colors.onPrimaryContainer}40`,
                borderTopColor: colors.onPrimaryContainer,
                display: 'inline-block',
                boxSizing: 'border-box',
              }}
              aria-label={t(locale, 'common.loading')}
            />
          </span>
        ) : null}
      </button>
      {error ? (
        <div
          style={{
            color: colors.error,
            fontSize: 12,
            marginTop: spacing.xs,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
