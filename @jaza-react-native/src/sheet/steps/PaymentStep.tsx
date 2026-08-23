import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Icon } from '../../components/Icon.js';
import { useJaza } from '../../provider/JazaContext.js';
import { formatLocalAmount, formatUsd } from '../../utils/helpers.js';
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

  const buyLabel = quote
    ? `Buy ${formatLocalAmount(quote.totalLocal, quote.currencyCode, selectedCurrency?.decimals)}`
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
      padding: spacing.md,
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
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
      fontSize: 20,
      fontWeight: '600',
    },
    balanceChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
    },
    balanceChipText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '500',
    },
    label: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: colors.outlineVariant,
      paddingBottom: spacing.xs,
    },
    dialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingRight: spacing.sm,
    },
    dialText: {
      color: colors.primaryContainer,
      fontSize: 28,
      fontWeight: '700',
    },
    phoneInput: {
      flex: 1,
      fontSize: 28,
      fontWeight: '600',
      color: colors.primaryContainer,
      letterSpacing: 2,
      paddingVertical: spacing.md,
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
      backgroundColor: colors.surfaceContainer,
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
      backgroundColor: colors.surfaceContainerLow,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    amountText: {
      color: colors.onSurface,
      fontSize: 24,
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
          <Text style={styles.headerTitle}>
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

      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.phoneRow}>
        <Pressable
          style={styles.dialBtn}
          onPress={() => setCountryPickerOpen(true)}
        >
          <Text style={styles.dialText}>
            +{selectedCountry?.dialCode ?? '…'}
          </Text>
          <Icon name="expand-more" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        <BottomSheetTextInput
          style={styles.phoneInput}
          value={phoneNational}
          onChangeText={setPhoneNational}
          placeholder="Phone number"
          placeholderTextColor={colors.surfaceVariant}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
        {predict && !predictLoading ? (
          <Icon name="check-circle" size={24} color={colors.primary} />
        ) : predictLoading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : null}
      </View>

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
              <Text style={styles.amountText}>
                {selectedCurrencyCode ?? '—'}
              </Text>
              <Icon name="expand-more" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : (
            <Text style={styles.amountText}>
              {selectedCurrencyCode ?? quote?.currencyCode ?? 'USD'}
            </Text>
          )}
          <Text style={styles.amountText}>
            {quote
              ? formatLocalAmount(
                  quote.totalLocal,
                  quote.currencyCode,
                  selectedCurrency?.decimals,
                )
              : selectedBundle
                ? formatUsd(selectedBundle.priceUsd)
                : '—'}
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
