'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { useJaza } from '../provider/JazaContext.js';
import { t } from '../i18n/t.js';

export type JazaActionButtonRenderProps = {
  onPress: () => void;
  canAfford: boolean;
  cost: number | null;
  balanceCredits: number | null;
  loading: boolean;
  disabled: boolean;
  label: string;
  error: string | null;
};

export type JazaActionButtonProps = {
  featureCode: string;
  label?: string;
  onPress: () => void | Promise<void>;
  style?: CSSProperties;
  children?: (props: JazaActionButtonRenderProps) => ReactNode;
};

/**
 * Gate-only control: opens paywall when the wallet cannot afford `featureCode`.
 * Never calls consume — host `onPress` must debit via the secret-key BFF.
 */
export function JazaActionButton({
  featureCode,
  label,
  onPress,
  style,
  children,
}: JazaActionButtonProps) {
  const {
    theme,
    locale,
    balanceCredits,
    getFeatureCost,
    canAfford,
    openPaywall,
  } = useJaza();
  const { colors, spacing, radius } = theme;
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const cost = getFeatureCost(featureCode);
  const known = cost !== null;
  const afford = known ? canAfford(featureCode) : false;
  const displayLabel = label ?? featureCode;
  const error = !known
    ? t(locale, 'action.unknownFeature', { code: featureCode })
    : actionError;

  const handlePress = () => {
    void (async () => {
      setActionError(null);
      if (!known) return;
      if (!afford) {
        await openPaywall({ featureCode });
        return;
      }
      setLoading(true);
      try {
        await onPress();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : t(locale, 'action.failed'),
        );
      } finally {
        setLoading(false);
      }
    })();
  };

  const renderProps: JazaActionButtonRenderProps = {
    onPress: handlePress,
    canAfford: afford,
    cost,
    balanceCredits,
    loading,
    disabled: loading || !known,
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
        className="jaza-btn"
        style={{
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: radius.full,
          padding: `${spacing.md}px ${spacing.lg}px`,
          color: colors.onSurface,
          fontSize: 16,
          fontWeight: 600,
          opacity: !known ? 0.5 : loading ? 0.85 : 1,
          ...style,
        }}
        onClick={handlePress}
        disabled={loading || !known}
        aria-busy={loading}
      >
        <span className="jaza-btn-label" data-loading={loading ? 'true' : 'false'}>
          <span>{displayLabel}</span>
          {known ? (
            <span style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>
              {t(locale, 'action.creditsMeta', { cost: cost! })}
            </span>
          ) : null}
        </span>
        {loading ? (
          <span className="jaza-btn-spinner" aria-hidden>
            <span
              className="jaza-spin"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${colors.surfaceContainerHighest}`,
                borderTopColor: colors.primary,
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
