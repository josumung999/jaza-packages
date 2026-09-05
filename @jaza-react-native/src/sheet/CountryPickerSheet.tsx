import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJaza } from '../provider/JazaContext.js';
import { t } from '../i18n/t.js';
import { createSelectableRowStyles } from '../theme/listStyles.js';

export type CountryPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CountryPickerSheet({
  visible,
  onClose,
}: CountryPickerSheetProps) {
  const { theme, locale, countries, selectedCountry, setSelectedCountry } =
    useJaza();
  const { colors, spacing, radius } = theme;
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const rowStyles = createSelectableRowStyles(theme);

  useEffect(() => {
    if (!visible) setQuery('');
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

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.gutter,
      paddingTop: spacing.md,
      paddingBottom: Math.max(insets.bottom, spacing.md),
      maxHeight: '85%',
      minHeight: 320,
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
      minHeight: 48,
      fontSize: 16,
      lineHeight: 22,
      color: colors.onSurface,
      marginBottom: spacing.md,
    },
    list: {
      flexGrow: 1,
      flexShrink: 1,
    },
    nameRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minWidth: 0,
    },
    flag: {
      fontSize: 24,
      flexShrink: 0,
    },
    dial: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      fontFamily: 'monospace',
      flexShrink: 0,
      marginLeft: spacing.sm,
    },
    empty: {
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <TextInput
            style={styles.search}
            placeholder={t(locale, 'payment.searchCountry')}
            placeholderTextColor={colors.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          <FlatList
            style={styles.list}
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
                  <View style={styles.nameRow}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text
                      style={[
                        rowStyles.label,
                        selected && rowStyles.labelSelected,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.dial}>+{item.dialCode}</Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>{t(locale, 'payment.noCountries')}</Text>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
