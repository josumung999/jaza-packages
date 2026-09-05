import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { JazaTheme } from '../theme/tokens.js';

const MAX_DIGITS = 15;

export type PhoneDigitInputProps = {
  theme: JazaTheme;
  value: string;
  onChangeText: (value: string) => void;
  dialPressable: ReactNode;
  trailing?: ReactNode;
};

/**
 * Glovo-style Country + Phone shaded fields (no underscore digit slots).
 */
export function PhoneDigitInput({
  theme,
  value,
  onChangeText,
  dialPressable,
  trailing,
}: PhoneDigitInputProps) {
  const { colors, spacing, radius } = theme;
  const inputRef = useRef<{ focus: () => void } | null>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.replace(/\D/g, '').slice(0, MAX_DIGITS);

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: spacing.sm,
      width: '100%',
    },
    field: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 64,
      justifyContent: 'center',
    },
    fieldFocused: {
      borderWidth: 1,
      borderColor: colors.primaryContainer,
    },
    countryField: {
      flexShrink: 0,
      minWidth: 100,
    },
    phoneField: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      fontWeight: '500',
      marginBottom: spacing.xs,
    },
    phoneInput: {
      flex: 1,
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
      padding: 0,
      margin: 0,
      fontVariant: ['tabular-nums'],
    },
  });

  return (
    <View style={styles.row}>
      <View style={[styles.field, styles.countryField]}>
        <Text style={styles.label}>Country</Text>
        {dialPressable}
      </View>
      <Pressable
        style={[
          styles.field,
          styles.phoneField,
          focused ? styles.fieldFocused : null,
        ]}
        onPress={() => inputRef.current?.focus()}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Phone Number</Text>
          <BottomSheetTextInput
            ref={inputRef as never}
            style={styles.phoneInput}
            value={digits}
            onChangeText={(text) =>
              onChangeText(text.replace(/\D/g, '').slice(0, MAX_DIGITS))
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={MAX_DIGITS}
            placeholder="Enter number"
            placeholderTextColor={colors.onSurfaceVariant}
          />
        </View>
        {trailing}
      </Pressable>
    </View>
  );
}
