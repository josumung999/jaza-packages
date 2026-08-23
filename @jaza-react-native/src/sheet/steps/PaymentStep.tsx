import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../../components/Icon.js';
import { PhoneDigitInput } from '../../components/PhoneDigitInput.js';
import { useJaza } from '../../provider/JazaContext.js';
import { formatCurrencyAmount, formatUsd } from '../../utils/helpers.js';
import { CountryPickerSheet } from '../CountryPickerSheet.js';
import { CurrencyPickerSheet } from '../CurrencyPickerSheet.js';

export function PaymentStep() {
  const {
    theme,
    balance,
    selectedBundle,
    selectedCountry,
    selectedCurrencyCode,
    setSelectedCurrencyCode,
    phoneNational,
    setPhoneNational,
    predict,
    predictLoading,
    predictError,
    quote,
    quoteLoading,
    quoteError,
    goToOffer,
    submitDeposit,
  } = useJaza();

  const { colors, spacing, radius } = theme;
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);

  const currencyOptions = useMemo(() => {
    if (predict?.currencies?.length) {
      return predict.currencies;
    }
    return selectedCountry?.currencies ?? [];
  }, [predict, selectedCountry]);

  const selectedCurrency = currencyOptions.find(
    (c) => c.code === selectedCurrencyCode,
  );

  const showCurrencyPicker = currencyOptions.length > 1;

  const formattedQuote = quote
    ? formatCurrencyAmount(
        quote.totalLocal,
        quote.currencyCode,
        selectedCurrency?.decimals,
      )
    : null;

  const buyLabel = quote
    ? `Buy ${formattedQuote}`
    : quoteLoading
      ? 'Loading…'
      : selectedBundle
        ? `Buy ${formatUsd(selectedBundle.priceUsd)}`
        : 'Buy';

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: colors.onSurface,
      fontSize: 24,
      fontWeight: '600',
      flexShrink: 1,
    },
    balanceChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.surfaceContainer,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
    },
    balanceChipText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '500',
    },
    dialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dialText: {
      color: colors.primaryContainer,
      fontSize: 22,
      fontWeight: '700',
    },
    providerText: {
      color: colors.primaryContainer,
      fontSize: 14,
      fontWeight: '500',
      marginTop: spacing.sm,
    },
    providerError: {
      color: colors.error,
      fontSize: 14,
      marginTop: spacing.sm,
    },
    payCard: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
      marginTop: spacing.lg,
    },
    payRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    currencyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    currencyCode: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
    },
    amountText: {
      color: colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
    },
    cta: {
      backgroundColor: colors.primaryContainer,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    ctaDisabled: { opacity: 0.5 },
    ctaText: {
      color: colors.onPrimaryContainer,
      fontSize: 16,
      fontWeight: '600',
    },
    quoteError: {
      color: colors.error,
      fontSize: 12,
      marginBottom: spacing.sm,
    },
  });

  const canSubmit =
    !!predict &&
    !!quote &&
    !quoteLoading &&
    !predictLoading &&
    phoneNational.replace(/\D/g, '').length >= 6;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backBtn} onPress={goToOffer}>
            <Icon name="arrow-back" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedBundle?.label ?? 'Top-up Balance'}
          </Text>
        </View>
        {balance !== null ? (
          <View style={styles.balanceChip}>
            <Icon name="bolt" size={16} color={colors.primary} />
            <Text style={styles.balanceChipText}>{balance.toLocaleString()}</Text>
          </View>
        ) : null}
      </View>

      <PhoneDigitInput
        theme={theme}
        value={phoneNational}
        onChangeText={setPhoneNational}
        dialPressable={
          <Pressable
            style={styles.dialBtn}
            onPress={() => setCountryPickerOpen(true)}
          >
            <Text style={styles.dialText}>
              +{selectedCountry?.dialCode ?? '…'}
            </Text>
            <Icon name="expand-more" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        }
        trailing={
          predict && !predictLoading ? (
            <Icon name="check-circle" size={24} color={colors.primary} />
          ) : predictLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : null
        }
      />

      {predict ? (
        <Text style={styles.providerText}>{predict.provider.displayName}</Text>
      ) : predictError ? (
        <Text style={styles.providerError}>{predictError}</Text>
      ) : null}

      <View style={styles.payCard}>
        <View style={styles.payRow}>
          {showCurrencyPicker ? (
            <Pressable
              style={styles.currencyBtn}
              onPress={() => setCurrencyPickerOpen(true)}
            >
              <Text style={styles.currencyCode}>
                {selectedCurrencyCode ?? '—'}
              </Text>
              <Icon name="expand-more" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : (
            <Text style={styles.currencyCode}>
              {selectedCurrencyCode ?? quote?.currencyCode ?? 'USD'}
            </Text>
          )}
          <Text style={styles.amountText}>
            {formattedQuote ??
              (selectedBundle ? formatUsd(selectedBundle.priceUsd) : '—')}
          </Text>
        </View>
        {quoteError ? <Text style={styles.quoteError}>{quoteError}</Text> : null}
        <Pressable
          style={[styles.cta, !canSubmit && styles.ctaDisabled]}
          onPress={() => void submitDeposit()}
          disabled={!canSubmit}
        >
          <Icon name="lock" size={18} color={colors.onPrimaryContainer} />
          <Text style={styles.ctaText}>{buyLabel}</Text>
        </Pressable>
      </View>

      <CountryPickerSheet
        visible={countryPickerOpen}
        onClose={() => setCountryPickerOpen(false)}
      />
      <CurrencyPickerSheet
        visible={currencyPickerOpen}
        currencies={currencyOptions}
        selectedCode={selectedCurrencyCode}
        onSelect={(code) => {
          setSelectedCurrencyCode(code);
          setCurrencyPickerOpen(false);
        }}
        onClose={() => setCurrencyPickerOpen(false)}
      />
    </View>
  );
}
