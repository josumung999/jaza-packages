import { Pressable, StyleSheet, Text, View } from 'react-native';
import { JazaLedger, useJaza } from '@jazadev/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useJaza();
  const { colors } = theme;

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    header: {
      marginBottom: 8,
      gap: 8,
    },
    back: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
    },
    backText: {
      color: colors.onSurfaceVariant,
      fontWeight: '500',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.onSurface,
    },
    list: {
      flex: 1,
    },
  });

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Transactions</Text>
      </View>
      <JazaLedger mode="scroll" style={styles.list} />
    </View>
  );
}
