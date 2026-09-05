import { Pressable, StyleSheet, Text, View } from 'react-native';
import { JazaLedger } from '@jazadev/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
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
    color: '#94a3b8',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  list: {
    flex: 1,
  },
});
