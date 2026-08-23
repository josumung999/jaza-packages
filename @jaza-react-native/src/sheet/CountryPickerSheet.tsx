import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useJaza } from '../provider/JazaContext.js';

export type CountryPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CountryPickerSheet({
  visible,
  onClose,
}: CountryPickerSheetProps) {
  const { theme, countries, selectedCountry, setSelectedCountry } = useJaza();
  const { colors, spacing, radius } = theme;
  const ref = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState('');

  const snapPoints = useMemo(() => ['70%'], []);

  useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [countries, query]);

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
    search: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.onSurface,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
      gap: spacing.md,
    },
    flag: { fontSize: 24 },
    name: {
      flex: 1,
      color: colors.onSurface,
      fontSize: 16,
    },
    dial: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      fontFamily: 'monospace',
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
        <TextInput
          style={styles.search}
          placeholder="Search country"
          placeholderTextColor={colors.onSurfaceVariant}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const selected = selectedCountry?.id === item.id;
            return (
              <Pressable
                style={[styles.row, selected && styles.selected]}
                onPress={() => {
                  setSelectedCountry(item);
                  onClose();
                }}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.dial}>+{item.dialCode}</Text>
              </Pressable>
            );
          }}
        />
      </View>
    </BottomSheetModal>
  );
}
