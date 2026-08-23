import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Skeleton } from './Skeleton.js';
import type { JazaTheme } from '../theme/tokens.js';

type BalanceCardSkeletonProps = {
  theme: JazaTheme;
  style?: ViewStyle;
};

/** Full balance card placeholder while credits load. */
export function BalanceCardSkeleton({ theme, style }: BalanceCardSkeletonProps) {
  const { colors, spacing, radius } = theme;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      padding: spacing.md,
    },
    label: {
      marginBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    icon: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    value: {
      flex: 1,
      maxWidth: 180,
    },
  });

  return (
    <View
      style={[styles.card, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading balance"
    >
      <Skeleton
        theme={theme}
        width="42%"
        height={14}
        borderRadius={6}
        style={styles.label}
      />
      <View style={styles.row}>
        <Skeleton theme={theme} style={styles.icon} height={28} borderRadius={14} />
        <Skeleton theme={theme} height={48} borderRadius={10} style={styles.value} />
      </View>
    </View>
  );
}
