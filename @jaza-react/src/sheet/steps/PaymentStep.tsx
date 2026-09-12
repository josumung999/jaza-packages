'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { Icon } from '../../components/Icon.js';
import { PhoneDigitInput } from '../../components/PhoneDigitInput.js';
import { t } from '../../i18n/t.js';
import { useJaza } from '../../provider/JazaContext.js';
import { formatCurrencyAmount, formatUsd } from '../../utils/helpers.js';
import { CountryPickerSheet } from '../CountryPickerSheet.js';
import { CurrencyPickerSheet } from '../CurrencyPickerSheet.js';

export function PaymentStep() {
  const {
    theme,
    locale,
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

  const showCurrencyPicker = currencyOptions.length > 1;

  const formattedQuote = quote
    ? formatCurrencyAmount(quote.totalLocal, quote.currencyCode)
    : null;

  const buyLabel = quote
    ? t(locale, 'topUp.buyAmount', { amount: formattedQuote! })
    : quoteLoading
      ? t(locale, 'common.loading')
      : selectedBundle
        ? t(locale, 'topUp.buyAmount', {
            amount: formatUsd(selectedBundle.priceUsd),
          })
        : t(locale, 'topUp.buy');

  const canSubmit =
    !!predict &&
    !!quote &&
    !quoteLoading &&
    !predictLoading &&
    phoneNational.replace(/\D/g, '').length >= 6;

  const backBtn: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
          gap: spacing.sm,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            flex: 1,
            minWidth: 0,
          }}
        >
          <button type="button" style={backBtn} onClick={goToOffer} aria-label={t(locale, 'common.close')}>
            <Icon name="arrow-back" size={22} color={colors.onSurfaceVariant} />
          </button>
          <h2
            style={{
              color: colors.onSurface,
              fontSize: 24,
              fontWeight: 600,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedBundle?.label ?? t(locale, 'topUp.balanceFallback')}
          </h2>
        </div>
        {balance !== null ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              backgroundColor: colors.surfaceContainer,
              padding: `${spacing.xs}px ${spacing.sm}px`,
              borderRadius: radius.full,
              flexShrink: 0,
            }}
          >
            <Icon name="bolt" size={16} color={colors.primary} />
            <span
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {balance.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>

      <PhoneDigitInput
        theme={theme}
        value={phoneNational}
        onChangeText={setPhoneNational}
        countryLabel={t(locale, 'payment.country')}
        phoneLabel={t(locale, 'payment.phone')}
        phonePlaceholder={t(locale, 'payment.phonePlaceholder')}
        dialPressable={
          <button
            type="button"
            onClick={() => setCountryPickerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing.xs,
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <span
              style={{
                color: colors.onSurface,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              +{selectedCountry?.dialCode ?? '…'}
            </span>
            <Icon name="expand-more" size={24} color={colors.onSurfaceVariant} />
          </button>
        }
        trailing={
          predict && !predictLoading ? (
            <Icon name="check-circle" size={24} color={colors.primary} />
          ) : predictLoading ? (
            <span
              className="jaza-spin"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${colors.surfaceContainerHighest}`,
                borderTopColor: colors.primary,
                display: 'inline-block',
                boxSizing: 'border-box',
              }}
              aria-label={t(locale, 'common.loading')}
            />
          ) : null
        }
      />

      {predict ? (
        <p
          style={{
            color: colors.primaryContainer,
            fontSize: 14,
            fontWeight: 500,
            margin: `${spacing.sm}px 0 0`,
          }}
        >
          {predict.provider.displayName}
        </p>
      ) : predictError ? (
        <p
          style={{
            color: colors.error,
            fontSize: 14,
            margin: `${spacing.sm}px 0 0`,
          }}
        >
          {predictError}
        </p>
      ) : null}

      <div
        style={{
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: radius.xl,
          border: `1px solid ${colors.outlineVariant}`,
          padding: spacing.md,
          marginTop: spacing.lg,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
          }}
        >
          {showCurrencyPicker ? (
            <button
              type="button"
              onClick={() => setCurrencyPickerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.xs,
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              <span
                style={{
                  color: colors.primaryContainer,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {selectedCurrencyCode ?? '—'}
              </span>
              <Icon name="expand-more" size={20} color={colors.primaryContainer} />
            </button>
          ) : (
            <span
              style={{
                color: colors.primaryContainer,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {selectedCurrencyCode ?? quote?.currencyCode ?? 'USD'}
            </span>
          )}
          <span
            style={{
              color: colors.onSurface,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {formattedQuote ??
              (selectedBundle ? formatUsd(selectedBundle.priceUsd) : '—')}
          </span>
        </div>
        {quoteError ? (
          <p
            style={{
              color: colors.error,
              fontSize: 12,
              margin: `0 0 ${spacing.sm}px`,
            }}
          >
            {quoteError}
          </p>
        ) : null}
        <button
          type="button"
          className="jaza-btn jaza-btn-primary"
          style={{ width: '100%', opacity: canSubmit ? 1 : 0.5 }}
          onClick={() => void submitDeposit()}
          disabled={!canSubmit}
        >
          <Icon name="lock" size={18} color={colors.onPrimaryContainer} />
          <span>{buyLabel}</span>
        </button>
      </div>

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
    </div>
  );
}
