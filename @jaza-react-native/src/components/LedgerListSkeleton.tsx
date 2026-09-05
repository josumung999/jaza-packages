import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Skeleton } from './Skeleton.js';
import type { JazaTheme } from '../theme/tokens.js';

type LedgerListSkeletonProps = {
  theme: JazaTheme;
  /** Preview shows fewer rows inside one card */
  mode?: 'preview' | 'scroll';
  rows?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

function LedgerRowSkeleton({ theme }: { theme: JazaTheme }) {
  const { spacing } = theme;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton theme={theme} width="55%" height={16} borderRadius={6} />
        <Skeleton theme={theme} width="40%" height={12} borderRadius={6} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Skeleton theme={theme} width={56} height={16} borderRadius={6} />
        <Skeleton theme={theme} width={64} height={18} borderRadius={8} />
      </View>
    </View>
  );
}

/** Shaded card placeholder matching default ledger chrome. */
export function LedgerListSkeleton({
  theme,
  mode = 'preview',
  rows,
  style,
  accessibilityLabel = 'Loading transactions',
}: LedgerListSkeletonProps) {
  const { colors, spacing, radius } = theme;
  const count = rows ?? (mode === 'preview' ? 3 : 5);

  const styles = StyleSheet.create({
    root: {
      gap: spacing.md,
    },
    date: {
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.outlineVariant,
      marginHorizontal: spacing.md,
    },
  });

  if (mode === 'preview') {
    return (
      <View
        style={[styles.root, style]}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.card}>
          {Array.from({ length: count }, (_, i) => (
            <View key={i}>
              <LedgerRowSkeleton theme={theme} />
              {i < count - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.root, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <Skeleton theme={theme} width="36%" height={14} borderRadius={6} style={styles.date} />
      <View style={styles.card}>
        {Array.from({ length: count }, (_, i) => (
          <View key={i}>
            <LedgerRowSkeleton theme={theme} />
            {i < count - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
