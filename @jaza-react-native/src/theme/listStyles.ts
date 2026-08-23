import { StyleSheet } from 'react-native';
import type { JazaTheme } from './tokens.js';

export function createSelectableRowStyles(theme: JazaTheme) {
  const { colors, spacing, radius } = theme;
  return StyleSheet.create({
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
    rowSelected: {
      borderColor: colors.bundleBorderSelected,
      borderWidth: 2,
    },
    label: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    labelSelected: {
      color: colors.primaryContainer,
    },
    sublabel: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      marginTop: 2,
    },
  });
}
