import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJaza } from '../provider/JazaContext.js';
import { createSelectableRowStyles } from '../theme/listStyles.js';

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
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const rowStyles = createSelectableRowStyles(theme);

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

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: '75%',
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
      paddingBottom: insets.bottom + spacing.md,
    },
    handle: {
      width: 48,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.surfaceContainerHighest,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    search: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.onSurface,
      marginBottom: spacing.md,
    },
    flag: { fontSize: 24 },
    dial: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      fontFamily: 'monospace',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
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
                  style={[rowStyles.row, selected && rowStyles.rowSelected]}
                  onPress={() => {
                    setSelectedCountry(item);
                    onClose();
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text
                      style={[rowStyles.label, selected && rowStyles.labelSelected]}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.dial}>+{item.dialCode}</Text>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
