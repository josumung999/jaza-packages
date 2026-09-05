import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useJaza } from '../provider/JazaContext.js';
import { formatCredits } from '../utils/helpers.js';
import {
  groupLedgerIntoRows,
  toLedgerItemProps,
  type JazaLedgerItemProps,
} from '../utils/ledgerItems.js';

export type { JazaLedgerItemProps } from '../utils/ledgerItems.js';
export { toLedgerItemProps } from '../utils/ledgerItems.js';

export type JazaLedgerProps = {
  /** `scroll` = full screen FlashList; `preview` = static list for embedding in ScrollView */
  mode?: 'scroll' | 'preview';
  /** Max items for preview (default 5). Also used as page size for scroll. */
  limit?: number;
  style?: ViewStyle;
  ItemComponent?: ComponentType<JazaLedgerItemProps>;
};

function DefaultLedgerItem({
  title,
  subtitle,
  credits,
  direction,
  statusLabel,
}: JazaLedgerItemProps) {
  const { theme } = useJaza();
  const { colors, spacing, radius } = theme;
  const amountColor =
    direction === 'credit' ? colors.success : colors.error;
  const sign = direction === 'credit' ? '+' : '−';

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
    },
    body: { flex: 1, gap: 2 },
    title: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    subtitle: {
      color: colors.onSurfaceVariant,
      fontSize: 13,
    },
    right: { alignItems: 'flex-end', gap: spacing.xs },
    amount: {
      color: amountColor,
      fontSize: 16,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
    pill: {
      backgroundColor: colors.surfaceContainerHigh,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    pillText: {
      color: colors.onSurfaceVariant,
      fontSize: 11,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>
          {sign}
          {formatCredits(credits)}
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{statusLabel}</Text>
        </View>
      </View>
    </View>
  );
}

export function JazaLedger({
  mode = 'preview',
  limit = 5,
  style,
  ItemComponent = DefaultLedgerItem,
}: JazaLedgerProps) {
  const { theme, client, status } = useJaza();
  const { colors, spacing } = theme;

  const [items, setItems] = useState<JazaLedgerItemProps[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = mode === 'preview' ? limit : Math.max(limit, 20);

  const fetchPage = useCallback(
    async (opts: { cursor?: string; replace: boolean }) => {
      const page = await client.listLedger({
        limit: pageSize,
        cursor: opts.cursor,
      });
      const mapped = page.items.map(toLedgerItemProps);
      setItems((prev) => (opts.replace ? mapped : [...prev, ...mapped]));
      setNextCursor(page.nextCursor ?? null);
    },
    [client, pageSize],
  );

  const loadInitial = useCallback(async () => {
    if (status !== 'AUTHENTICATED') return;
    setLoading(true);
    setError(null);
    try {
      await fetchPage({ replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load ledger');
    } finally {
      setLoading(false);
    }
  }, [fetchPage, status]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await fetchPage({ replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh ledger');
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  const onEndReached = useCallback(async () => {
    if (mode !== 'scroll' || !nextCursor || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      await fetchPage({ cursor: nextCursor, replace: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load more');
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, loading, loadingMore, mode, nextCursor]);

  const displayItems = useMemo(
    () => (mode === 'preview' ? items.slice(0, limit) : items),
    [items, limit, mode],
  );

  const rows = useMemo(
    () => (mode === 'scroll' ? groupLedgerIntoRows(displayItems) : null),
    [displayItems, mode],
  );

  const styles = StyleSheet.create({
    root: { flex: mode === 'scroll' ? 1 : undefined, ...style },
    preview: { gap: 0 },
    header: {
      color: colors.onSurfaceVariant,
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    empty: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      paddingVertical: spacing.lg,
      textAlign: 'center',
    },
    error: {
      color: colors.error,
      fontSize: 13,
      marginBottom: spacing.sm,
    },
    retry: {
      alignSelf: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    retryText: {
      color: colors.primary,
      fontWeight: '600',
    },
    footer: { paddingVertical: spacing.md },
  });

  if (loading && items.length === 0) {
    return (
      <View style={[styles.root, { paddingVertical: spacing.lg }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retry} onPress={() => void loadInitial()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (displayItems.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.empty}>No transactions yet</Text>
      </View>
    );
  }

  if (mode === 'preview') {
    return (
      <View style={[styles.root, styles.preview]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {displayItems.map((item) => (
          <ItemComponent key={item.id} {...item} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlashList
        data={rows ?? []}
        keyExtractor={(row) => row.key}
        getItemType={(row) => row.kind}
        renderItem={({ item: row }) =>
          row.kind === 'header' ? (
            <Text style={styles.header}>{row.label}</Text>
          ) : (
            <ItemComponent {...row.item} />
          )
        }
        onEndReached={() => void onEndReached()}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
