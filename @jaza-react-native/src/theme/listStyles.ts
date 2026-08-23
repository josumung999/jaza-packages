import { StyleSheet } from 'react-native';
import type { JazaTheme } from './tokens.js';

/** Flat list rows: hairline bottom border; selected = teal label only. */
export function createSelectableRowStyles(theme: JazaTheme) {
  const { colors, spacing } = theme;
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
      gap: spacing.md,
    },
    rowSelected: {
      borderBottomColor: colors.primaryContainer,
    },
    label: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '500',
      flexShrink: 1,
    },
    labelSelected: {
      color: colors.primaryContainer,
      fontWeight: '600',
    },
    sublabel: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
    },
  });
}
