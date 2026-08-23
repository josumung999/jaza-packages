import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { BalanceCardSkeleton } from '../components/BalanceCardSkeleton.js';
import { Icon } from '../components/Icon.js';
import { useJaza } from '../provider/JazaContext.js';
import { formatCredits } from '../utils/helpers.js';

export type JazaBalanceWidgetProps = {
  style?: ViewStyle;
};

export function JazaBalanceWidget({ style }: JazaBalanceWidgetProps) {
  const { theme, balance, balanceLoading, balanceError, refreshBalance } =
    useJaza();
  const { colors, spacing, radius } = theme;

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

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

  if (balanceLoading && balance === null) {
    return <BalanceCardSkeleton theme={theme} style={style} />;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Current Balance</Text>
      <View style={styles.row}>
        <Icon name="bolt" size={28} color={colors.primary} />
        <Text style={styles.value}>
          {balance !== null ? formatCredits(balance) : '—'}
        </Text>
      </View>
      {balanceError ? (
        <Text style={styles.error}>{balanceError}</Text>
      ) : null}
    </View>
  );
}
