import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { JazaTheme } from '../theme/tokens.js';

const MAX_DIGITS = 10;

export type PhoneDigitInputProps = {
  theme: JazaTheme;
  value: string;
  onChangeText: (value: string) => void;
  dialPressable: ReactNode;
  trailing?: ReactNode;
};

export function PhoneDigitInput({
  theme,
  value,
  onChangeText,
  dialPressable,
  trailing,
}: PhoneDigitInputProps) {
  const { colors, spacing } = theme;
  const digits = value.replace(/\D/g, '').slice(0, MAX_DIGITS);

  const styles = StyleSheet.create({
    label: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    phoneInput: {
      flex: 1,
      fontSize: 28,
      fontWeight: '600',
      color: colors.primaryContainer,
      paddingVertical: spacing.sm,
    },
    slots: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    slot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.outlineVariant,
    },
    slotFilled: {
      backgroundColor: colors.primary,
    },
  });

  return (
    <View>
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.row}>
        {dialPressable}
        <BottomSheetTextInput
          style={styles.phoneInput}
          value={digits}
          onChangeText={(text) =>
            onChangeText(text.replace(/\D/g, '').slice(0, MAX_DIGITS))
          }
          placeholder="Phone number"
          placeholderTextColor={colors.surfaceVariant}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={MAX_DIGITS}
        />
        {trailing}
      </View>
      <View style={styles.slots}>
        {Array.from({ length: MAX_DIGITS }, (_, i) => (
          <View
            key={i}
            style={[styles.slot, i < digits.length && styles.slotFilled]}
          />
        ))}
      </View>
    </View>
  );
}
