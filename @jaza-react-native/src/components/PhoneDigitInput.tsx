import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  const inputRef = useRef<{ focus: () => void } | null>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.replace(/\D/g, '').slice(0, MAX_DIGITS);
  /** Next empty slot, or last slot when the number is complete. */
  const activeIndex =
    digits.length >= MAX_DIGITS ? MAX_DIGITS - 1 : digits.length;

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
      width: '100%',
      gap: spacing.sm,
    },
    slots: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 40,
    },
    slot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    slotChar: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      fontVariant: ['tabular-nums'],
    },
    slotCharFocused: {
      color: colors.primaryContainer,
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      height: 1,
      width: 1,
    },
  });

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View>
      <Text style={styles.label}>Phone Number</Text>
      <Pressable style={styles.row} onPress={focusInput}>
        {dialPressable}
        <View style={styles.slots} pointerEvents="none">
          {Array.from({ length: MAX_DIGITS }, (_, i) => {
            const char = digits[i];
            const isFocused = focused && i === activeIndex;
            return (
              <View key={i} style={styles.slot}>
                <Text
                  style={[
                    styles.slotChar,
                    isFocused ? styles.slotCharFocused : null,
                  ]}
                >
                  {char ?? '_'}
                </Text>
              </View>
            );
          })}
        </View>
        {trailing}
        <BottomSheetTextInput
          ref={inputRef as never}
          style={styles.hiddenInput}
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
          caretHidden
        />
      </Pressable>
    </View>
  );
}
