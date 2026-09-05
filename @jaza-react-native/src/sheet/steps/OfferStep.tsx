import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BalanceCardSkeleton } from '../../components/BalanceCardSkeleton.js';
import { BundleListSkeleton } from '../../components/BundleListSkeleton.js';
import { Icon } from '../../components/Icon.js';
import { useJaza } from '../../provider/JazaContext.js';
import type { Bundle } from '../../api/types.js';
import { formatCredits, formatUsd } from '../../utils/helpers.js';

export function OfferStep() {
  const {
    theme,
    balance,
    balanceLoading,
    bundles,
    bundlesLoading,
    bundlesError,
    selectedBundle,
    setSelectedBundle,
    goToPayment,
    topUpSource,
    paywallFeatureCode,
    getFeatureCost,
    features,
  } = useJaza();
  const { colors, spacing, radius } = theme;

  const showLowBalanceAlert = topUpSource === 'paywall';
  const paywallFeature = paywallFeatureCode
    ? features.find((f) => f.code === paywallFeatureCode)
    : undefined;
  const paywallCost = paywallFeatureCode
    ? getFeatureCost(paywallFeatureCode)
    : null;
  const lowBalanceMessage =
    paywallCost != null
      ? `Your balance is too low for this action (${formatCredits(paywallCost)} credits${
          paywallFeature?.name ? ` · ${paywallFeature.name}` : ''
        }). Top up to continue.`
      : 'Your balance is running low. Top up to continue.';

  const styles = StyleSheet.create({
    balanceCard: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      padding: spacing.md,
      marginBottom: showLowBalanceAlert ? spacing.sm : spacing.lg,
    },
    balanceLabel: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      marginBottom: spacing.xs,
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    balanceValue: {
      color: colors.onSurface,
      fontSize: 48,
      fontWeight: '700',
    },
    alert: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: 'rgba(232, 185, 49, 0.14)',
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(232, 185, 49, 0.35)',
    },
    alertText: {
      flex: 1,
      color: colors.onSurface,
      fontSize: 14,
      lineHeight: 20,
    },
    title: {
      color: colors.onSurface,
      fontSize: 24,
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    bundle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: colors.bundleBg,
      borderWidth: 1,
      borderColor: colors.bundleBorder,
      marginBottom: spacing.sm,
    },
    bundleSelected: {
      borderColor: colors.bundleBorderSelected,
      borderWidth: 2,
    },
    bundleLabel: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
    },
    bundleLabelSelected: {
      color: colors.primaryContainer,
    },
    bundleSub: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      marginTop: 2,
    },
    bundleCredits: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
    },
    bundlePrice: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      fontFamily: 'monospace',
    },
    cta: {
      backgroundColor: colors.primaryContainer,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    ctaText: {
      color: colors.onPrimaryContainer,
      fontSize: 16,
      fontWeight: '600',
    },
    error: {
      color: colors.error,
      fontSize: 14,
      marginBottom: spacing.md,
      lineHeight: 20,
    },
  });

  const renderBundle = (bundle: Bundle) => {
    const selected = selectedBundle?.id === bundle.id;
    return (
      <Pressable
        key={bundle.id}
        style={[styles.bundle, selected && styles.bundleSelected]}
        onPress={() => setSelectedBundle(bundle)}
      >
        <View>
          <Text
            style={[styles.bundleLabel, selected && styles.bundleLabelSelected]}
          >
            {bundle.label ?? 'Bundle'}
          </Text>
          <Text style={styles.bundleSub}>
            {formatCredits(bundle.credits)} credits
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.bundleCredits}>
            {formatCredits(bundle.credits)}
          </Text>
          <Text style={styles.bundlePrice}>{formatUsd(bundle.priceUsd)} USD</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      {balanceLoading && balance === null ? (
        <BalanceCardSkeleton
          theme={theme}
          style={{ marginBottom: showLowBalanceAlert ? spacing.sm : spacing.lg }}
        />
      ) : (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.balanceRow}>
            <Icon name="bolt" size={28} color={colors.primary} />
            <Text style={styles.balanceValue}>
              {balance !== null ? formatCredits(balance) : '—'}
            </Text>
          </View>
        </View>
      )}

      {showLowBalanceAlert ? (
        <View
          style={styles.alert}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Icon name="info" size={20} color="#e8b931" />
          <Text style={styles.alertText}>{lowBalanceMessage}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>Top-up Credits</Text>

      {bundlesError ? <Text style={styles.error}>{bundlesError}</Text> : null}

      {bundlesLoading ? (
        <BundleListSkeleton theme={theme} />
      ) : (
        bundles.map(renderBundle)
      )}

      {!bundlesLoading && !bundlesError && bundles.length === 0 ? (
        <Text style={styles.error}>No active bundles for this app.</Text>
      ) : null}

      <Pressable
        style={styles.cta}
        onPress={goToPayment}
        disabled={!selectedBundle}
      >
        <Text style={styles.ctaText}>
          Continue with {selectedBundle?.label ?? 'bundle'}
        </Text>
        <Icon name="arrow-forward" size={20} color={colors.onPrimaryContainer} />
      </Pressable>
    </View>
  );
}
