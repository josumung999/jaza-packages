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
import { Icon } from '../components/Icon.js';
import { LedgerListSkeleton } from '../components/LedgerListSkeleton.js';
import { useJaza } from '../provider/JazaContext.js';
import { formatCredits } from '../utils/helpers.js';
import {
  groupLedgerIntoSections,
  toLedgerItemProps,
  type JazaLedgerItemProps,
  type LedgerSection,
} from '../utils/ledgerItems.js';

export type { JazaLedgerItemProps, JazaLedgerItemStatus } from '../utils/ledgerItems.js';
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
  status,
  statusLabel,
}: JazaLedgerItemProps) {
  const { theme } = useJaza();
  const { colors, spacing, radius } = theme;
  const sign = direction === 'credit' ? '' : '−';

  const badgeTone =
    status === 'failure'
      ? { fg: colors.error, bg: 'rgba(255, 180, 171, 0.18)' }
      : status === 'pending'
        ? { fg: '#e8b931', bg: 'rgba(232, 185, 49, 0.18)' }
        : { fg: colors.primary, bg: 'rgba(87, 241, 219, 0.18)' };

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    body: { flex: 1, gap: 4 },
    title: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    subtitle: {
      color: colors.onSurfaceVariant,
      fontSize: 13,
    },
    right: { alignItems: 'flex-end', gap: 4 },
    amount: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
    badge: {
      backgroundColor: badgeTone.bg,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.md,
    },
    badgeText: {
      color: badgeTone.fg,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>
          {sign}
          {formatCredits(credits)}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function LedgerSectionCard({
  section,
  ItemComponent,
  showDateLabel,
}: {
  section: LedgerSection;
  ItemComponent: ComponentType<JazaLedgerItemProps>;
  showDateLabel: boolean;
}) {
  const { theme } = useJaza();
  const { colors, spacing, radius } = theme;

  const styles = StyleSheet.create({
    block: {
      marginBottom: spacing.md,
    },
    dateLabel: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.outlineVariant,
      marginHorizontal: spacing.md,
    },
  });

  return (
    <View style={styles.block}>
      {showDateLabel ? (
        <Text style={styles.dateLabel}>{section.label}</Text>
      ) : null}
      <View style={styles.card}>
        {section.items.map((item, index) => (
          <View key={item.id}>
            <ItemComponent {...item} />
            {index < section.items.length - 1 ? (
              <View style={styles.divider} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function LedgerPlaceholder({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  const { theme } = useJaza();
  const { colors, spacing, radius } = theme;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    message: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    retry: {
      marginTop: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainerHigh,
    },
    retryText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
  });

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <Icon name="bolt" size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.retry} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function JazaLedger({
  mode = 'preview',
  limit = 5,
  style,
  ItemComponent = DefaultLedgerItem,
}: JazaLedgerProps) {
  const { theme, client, status, ledgerRevision } = useJaza();
  const { colors, spacing } = theme;

  const [items, setItems] = useState<JazaLedgerItemProps[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  // Start true so the first paint is skeleton, not the empty placeholder.
  const [loading, setLoading] = useState(true);
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
      const mapped = page.items.map((entry) =>
        toLedgerItemProps(entry, {
          subtitleStyle: mode === 'preview' ? 'date-time' : 'time',
        }),
      );
      setItems((prev) => (opts.replace ? mapped : [...prev, ...mapped]));
      setNextCursor(page.nextCursor ?? null);
    },
    [client, mode, pageSize],
  );

  const loadInitial = useCallback(async () => {
    if (status !== 'AUTHENTICATED') {
      // Stay in loading until auth is ready — avoid empty flash.
      setLoading(true);
      return;
    }
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
  }, [loadInitial, ledgerRevision]);

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

  const sections = useMemo(
    () => groupLedgerIntoSections(displayItems),
    [displayItems],
  );

  const showDateLabels = mode === 'scroll';

  const previewSections = useMemo((): LedgerSection[] => {
    if (mode !== 'preview' || displayItems.length === 0) return sections;
    return [
      {
        key: 'preview',
        label: '',
        items: displayItems,
      },
    ];
  }, [displayItems, mode, sections]);

  const listSections = mode === 'preview' ? previewSections : sections;

  const styles = StyleSheet.create({
    root: { flex: mode === 'scroll' ? 1 : undefined, ...style },
    footer: { paddingVertical: spacing.md },
  });

  if (loading && items.length === 0) {
    return (
      <View style={styles.root}>
        <LedgerListSkeleton
          theme={theme}
          mode={mode}
          rows={mode === 'preview' ? Math.min(limit, 3) : 5}
        />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.root}>
        <LedgerPlaceholder
          title="Couldn’t load transactions"
          message={error}
          onRetry={() => void loadInitial()}
        />
      </View>
    );
  }

  if (displayItems.length === 0) {
    return (
      <View style={styles.root}>
        <LedgerPlaceholder
          title="No transactions yet"
          message="Top-ups and purchases will show up here."
        />
      </View>
    );
  }

  if (mode === 'preview') {
    return (
      <View style={styles.root}>
        {listSections.map((section) => (
          <LedgerSectionCard
            key={section.key}
            section={section}
            ItemComponent={ItemComponent}
            showDateLabel={false}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlashList
        data={listSections}
        keyExtractor={(section) => section.key}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: section }) => (
          <LedgerSectionCard
            section={section}
            ItemComponent={ItemComponent}
            showDateLabel={showDateLabels}
          />
        )}
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
