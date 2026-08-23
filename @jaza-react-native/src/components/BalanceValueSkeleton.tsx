import { StyleSheet, View } from 'react-native';
import { Icon } from './Icon.js';
import { Skeleton } from './Skeleton.js';
import type { JazaTheme } from '../theme/tokens.js';

type BalanceValueSkeletonProps = {
  theme: JazaTheme;
};

/** Placeholder for the large credit balance next to the bolt icon. */
export function BalanceValueSkeleton({ theme }: BalanceValueSkeletonProps) {
  const { colors, spacing } = theme;

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    value: {
      flex: 1,
      maxWidth: 180,
    },
  });

  return (
    <View style={styles.row}>
      <Icon name="bolt" size={28} color={colors.primary} />
      <Skeleton theme={theme} height={48} borderRadius={10} style={styles.value} />
    </View>
  );
}
