import { useEffect, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
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
  style?: ViewStyle;
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

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      padding: spacing.md,
      ...style,
    },
    label: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      marginBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    value: {
      color: colors.onSurface,
      fontSize: 48,
      fontWeight: '700',
      letterSpacing: -1,
    },
    error: {
      color: colors.error,
      fontSize: 14,
      marginTop: spacing.xs,
    },
  });

  if (balanceLoading && balanceCredits === null) {
    return <BalanceCardSkeleton theme={theme} style={style} accessibilityLabel={t(locale, 'balance.loading')} />;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t(locale, 'balance.current')}</Text>
      <View style={styles.row}>
        <Icon name="bolt" size={28} color={colors.primary} />
        <Text style={styles.value}>
          {balanceCredits !== null ? formatCredits(balanceCredits) : '—'}
        </Text>
      </View>
      {balanceError ? (
        <Text style={styles.error}>{balanceError}</Text>
      ) : null}
    </View>
  );
}

/** @deprecated Prefer `JazaBalance` */
export type JazaBalanceWidgetProps = JazaBalanceProps;

/** @deprecated Prefer `JazaBalance` */
export const JazaBalanceWidget = JazaBalance;
