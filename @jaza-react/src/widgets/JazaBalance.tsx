'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { BalanceCardSkeleton } from '../components/BalanceCardSkeleton.js';
import { Icon } from '../components/Icon.js';
import { t } from '../i18n/t.js';
import { useJaza } from '../provider/JazaContext.js';
import { formatCredits } from '../utils/helpers.js';

export type JazaBalanceRenderProps = {
  balanceCredits: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export type JazaBalanceProps = {
  style?: CSSProperties;
  children?: (props: JazaBalanceRenderProps) => ReactNode;
};

export function JazaBalance({ style, children }: JazaBalanceProps) {
  const {
    theme,
    locale,
    balanceCredits,
    balanceLoading,
    balanceError,
    refreshBalance,
  } = useJaza();
  const { colors, spacing, radius } = theme;

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  const renderProps: JazaBalanceRenderProps = {
    balanceCredits,
    loading: balanceLoading,
    error: balanceError,
    refresh: refreshBalance,
  };

  if (children) {
    return <>{children(renderProps)}</>;
  }

  if (balanceLoading && balanceCredits === null) {
    return (
      <BalanceCardSkeleton
        theme={theme}
        style={style}
        accessibilityLabel={t(locale, 'balance.loading')}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: radius.xl,
        padding: spacing.md,
        ...style,
      }}
    >
      <div
        style={{
          color: colors.onSurfaceVariant,
          fontSize: 14,
          marginBottom: spacing.xs,
        }}
      >
        {t(locale, 'balance.current')}
      </div>
      <div className="jaza-row" style={{ gap: spacing.sm }}>
        <Icon name="bolt" size={28} color={colors.primary} />
        <div
          style={{
            color: colors.onSurface,
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          {balanceCredits !== null ? formatCredits(balanceCredits) : '—'}
        </div>
      </div>
      {balanceError ? (
        <div
          style={{
            color: colors.error,
            fontSize: 14,
            marginTop: spacing.xs,
          }}
        >
          {balanceError}
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Prefer `JazaBalance` */
export type JazaBalanceWidgetProps = JazaBalanceProps;

/** @deprecated Prefer `JazaBalance` */
export const JazaBalanceWidget = JazaBalance;
