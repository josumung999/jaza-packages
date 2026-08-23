import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJaza } from '../provider/JazaContext.js';
import { createSelectableRowStyles } from '../theme/listStyles.js';

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
  const insets = useSafeAreaInsets();
  const rowStyles = createSelectableRowStyles(theme);

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
      maxHeight: '50%',
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
    title: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: spacing.md,
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
          <Text style={styles.title}>Select currency</Text>
          <FlatList
            data={currencies}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const selected = selectedCode === item.code;
              return (
                <Pressable
                  style={[rowStyles.row, selected && rowStyles.rowSelected]}
                  onPress={() => onSelect(item.code)}
                >
                  <Text
                    style={[rowStyles.label, selected && rowStyles.labelSelected]}
                  >
                    {item.code}
                  </Text>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
