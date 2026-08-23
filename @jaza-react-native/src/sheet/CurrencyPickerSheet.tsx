import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useJaza } from '../provider/JazaContext.js';

export type CurrencyOption = {
  code: string;
  decimals: number;
};

export type CurrencyPickerSheetProps = {
  visible: boolean;
  currencies: CurrencyOption[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
};

export function CurrencyPickerSheet({
  visible,
  currencies,
  selectedCode,
  onSelect,
  onClose,
}: CurrencyPickerSheetProps) {
  const { theme } = useJaza();
  const { colors, spacing, radius } = theme;
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const styles = StyleSheet.create({
    title: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    row: {
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
    },
    code: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    selected: {
      backgroundColor: `${colors.primary}15`,
    },
  });

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.surfaceContainerHighest }}
    >
      <View style={{ paddingHorizontal: spacing.gutter, flex: 1 }}>
        <Text style={styles.title}>Select currency</Text>
        <FlatList
          data={currencies}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const selected = selectedCode === item.code;
            return (
              <Pressable
                style={[styles.row, selected && styles.selected]}
                onPress={() => onSelect(item.code)}
              >
                <Text style={styles.code}>{item.code}</Text>
              </Pressable>
            );
          }}
        />
      </View>
    </BottomSheetModal>
  );
}
