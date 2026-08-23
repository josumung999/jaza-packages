import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton.js';
import type { JazaTheme } from '../theme/tokens.js';

type BundleListSkeletonProps = {
  theme: JazaTheme;
  count?: number;
};

function BundleRowSkeleton({ theme }: { theme: JazaTheme }) {
  const { colors, spacing, radius } = theme;

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: colors.bundleBg,
      borderWidth: 1,
      borderColor: colors.bundleBorder,
      marginBottom: spacing.sm,
    },
    left: {
      flex: 1,
      marginRight: spacing.md,
      gap: spacing.xs + 2,
    },
    right: {
      alignItems: 'flex-end',
      gap: spacing.xs + 2,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Skeleton theme={theme} width="72%" height={18} borderRadius={6} />
        <Skeleton theme={theme} width="48%" height={14} borderRadius={6} />
      </View>
      <View style={styles.right}>
        <Skeleton theme={theme} width={56} height={18} borderRadius={6} />
        <Skeleton theme={theme} width={72} height={12} borderRadius={4} />
      </View>
    </View>
  );
}

/** Placeholder rows matching bundle card layout while offers load. */
export function BundleListSkeleton({ theme, count = 3 }: BundleListSkeletonProps) {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading bundles">
      {Array.from({ length: count }, (_, index) => (
        <BundleRowSkeleton key={index} theme={theme} />
      ))}
    </View>
  );
}
