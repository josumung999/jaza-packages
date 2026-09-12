'use client';

import type { CSSProperties } from 'react';
import { BalanceCardSkeleton } from '../../components/BalanceCardSkeleton.js';
import { BundleListSkeleton } from '../../components/BundleListSkeleton.js';
import { Icon } from '../../components/Icon.js';
import { t } from '../../i18n/t.js';
import { useJaza } from '../../provider/JazaContext.js';
import type { Bundle } from '../../api/types.js';
import { formatCredits, formatUsd } from '../../utils/helpers.js';

export function OfferStep() {
  const {
    theme,
    locale,
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
      ? t(locale, 'topUp.lowBalanceWithCost', {
          cost: formatCredits(paywallCost),
          feature: paywallFeature?.name ? ` · ${paywallFeature.name}` : '',
        })
      : t(locale, 'topUp.lowBalance');

  const balanceCard: CSSProperties = {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: showLowBalanceAlert ? spacing.sm : spacing.lg,
  };

  const renderBundle = (bundle: Bundle) => {
    const selected = selectedBundle?.id === bundle.id;
    return (
      <button
        key={bundle.id}
        type="button"
        onClick={() => setSelectedBundle(bundle)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: spacing.md,
          borderRadius: radius.xl,
          backgroundColor: colors.bundleBg,
          border: selected
            ? `2px solid ${colors.bundleBorderSelected}`
            : `1px solid ${colors.bundleBorder}`,
          marginBottom: spacing.sm,
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <div
            style={{
              color: selected ? colors.primaryContainer : colors.onSurface,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {bundle.label ?? t(locale, 'common.bundle')}
          </div>
          <div
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {formatCredits(bundle.credits)} {t(locale, 'common.credits')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              color: colors.onSurface,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {formatCredits(bundle.credits)}
          </div>
          <div
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {formatUsd(bundle.priceUsd)} USD
          </div>
        </div>
      </button>
    );
  };

  return (
    <div>
      {balanceLoading && balance === null ? (
        <BalanceCardSkeleton
          theme={theme}
          style={{
            marginBottom: showLowBalanceAlert ? spacing.sm : spacing.lg,
          }}
          accessibilityLabel={t(locale, 'balance.loading')}
        />
      ) : (
        <div style={balanceCard}>
          <div
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 14,
              marginBottom: spacing.xs,
            }}
          >
            {t(locale, 'balance.current')}
          </div>
          <div className="jaza-row" style={{ gap: spacing.sm }}>
            <Icon name="bolt" size={28} color={colors.primary} />
            <div
              style={{
                color: colors.onSurface,
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {balance !== null ? formatCredits(balance) : '—'}
            </div>
          </div>
        </div>
      )}

      {showLowBalanceAlert ? (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing.sm,
            backgroundColor: colors.warningContainer,
            borderRadius: radius.lg,
            padding: `${spacing.sm}px ${spacing.md}px`,
            marginBottom: spacing.lg,
            border: `1px solid ${colors.warning}59`,
          }}
        >
          <Icon name="info" size={20} color={colors.warning} />
          <div
            style={{
              flex: 1,
              color: colors.onSurface,
              fontSize: 14,
              lineHeight: '20px',
            }}
          >
            {lowBalanceMessage}
          </div>
        </div>
      ) : null}

      <h2
        style={{
          color: colors.onSurface,
          fontSize: 24,
          fontWeight: 600,
          margin: `0 0 ${spacing.md}px`,
        }}
      >
        {t(locale, 'topUp.title')}
      </h2>

      {bundlesError ? (
        <p
          style={{
            color: colors.error,
            fontSize: 14,
            margin: `0 0 ${spacing.md}px`,
            lineHeight: '20px',
          }}
        >
          {bundlesError}
        </p>
      ) : null}

      {bundlesLoading ? (
        <BundleListSkeleton
          theme={theme}
          accessibilityLabel={t(locale, 'topUp.bundlesLoading')}
        />
      ) : (
        bundles.map(renderBundle)
      )}

      {!bundlesLoading && !bundlesError && bundles.length === 0 ? (
        <p style={{ color: colors.error, fontSize: 14, margin: 0 }}>
          {t(locale, 'topUp.noBundles')}
        </p>
      ) : null}

      <button
        type="button"
        className="jaza-btn jaza-btn-primary"
        style={{
          width: '100%',
          marginTop: spacing.lg,
          opacity: selectedBundle ? 1 : 0.5,
        }}
        onClick={goToPayment}
        disabled={!selectedBundle}
      >
        <span>
          {t(locale, 'common.continueWith', {
            label: selectedBundle?.label ?? t(locale, 'common.bundle'),
          })}
        </span>
        <Icon name="arrow-forward" size={20} color={colors.onPrimaryContainer} />
      </button>
    </div>
  );
}
