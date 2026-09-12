'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { JazaSdkError } from '../api/errors.js';
import { PublicClient } from '../api/publicClient.js';
import { ClientRealtime } from '../api/realtimeClient.js';
import type {
  Bundle,
  InitFeature,
  InitResult,
  JazaAuthStatus,
  PredictProviderResponse,
  PublicDeposit,
  QuotePaymentResponse,
  TopUpCompleteResult,
} from '../api/types.js';
import {
  buildE164,
  enrichCountries,
  isDepositTerminal,
  pickDefaultCurrencyCode,
  type EnrichedCountry,
} from '../utils/helpers.js';
import {
  canAffordFeature,
  getFeatureCost as lookupFeatureCost,
} from '../utils/featureGate.js';
import { applyThemeCssVars } from '../theme/cssVars.js';
import {
  resolveTheme,
  type JazaTheme,
  type ThemePreference,
} from '../theme/tokens.js';
import type { JazaLocale } from '../i18n/types.js';
import { JazaContext, type ResultPhase, type TopUpSource, type TopUpStep } from './JazaContext.js';
import { TopUpDrawer } from '../sheet/TopUpDrawer.js';

function getSystemScheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

const PREDICT_DEBOUNCE_MS = 500;
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120_000;

export type JazaProviderProps = {
  publishableKey: string;
  apiBaseUrl?: string;
  /**
   * Host POST that returns InitResult (app auth via cookies/headers).
   * Ignored when `getSession` is also provided.
   */
  authEndpoint?: string;
  /** Imperative init handshake; preferred over `authEndpoint` when both set. */
  getSession?: () => Promise<InitResult>;
  /**
   * Called when the client-session handshake fails.
   * Do not unmount `JazaProvider` while screens that call `useJaza` are still active —
   * navigate away first, then clear host session.
   */
  onAuthError?: (error: Error) => void;
  /**
   * @deprecated Prefer `getSession` / `authEndpoint`. Used only when neither is set.
   */
  getBalance?: () => Promise<number>;
  onTopUpComplete?: (result: TopUpCompleteResult) => void;
  theme?: ThemePreference;
  /** Built-in UI locale. Default `en`. */
  locale?: JazaLocale;
  children: ReactNode;
};

async function fetchSessionFromEndpoint(
  authEndpoint: string,
): Promise<InitResult> {
  const res = await fetch(authEndpoint, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  const data = (await res.json().catch(() => ({}))) as InitResult & {
    message?: string;
  };
  if (!res.ok) {
    throw new JazaSdkError(
      res.status,
      data.message ?? `Init failed (${res.status})`,
      data,
    );
  }
  if (!data.sessionToken?.trim()) {
    throw new JazaSdkError(500, 'Init response missing sessionToken', data);
  }
  return data;
}

export function JazaProvider({
  publishableKey,
  apiBaseUrl,
  authEndpoint,
  getSession,
  onAuthError,
  getBalance,
  onTopUpComplete,
  theme: themePreference = 'system',
  locale: localeProp = 'en',
  children,
}: JazaProviderProps) {
  const useSessionAuth = Boolean(getSession || authEndpoint);
  if (!useSessionAuth && !getBalance) {
    throw new Error(
      'JazaProvider requires getSession, authEndpoint, or getBalance',
    );
  }

  const onAuthErrorRef = useRef(onAuthError);
  onAuthErrorRef.current = onAuthError;
  const getSessionRef = useRef(getSession);
  getSessionRef.current = getSession;
  const authEndpointRef = useRef(authEndpoint);
  authEndpointRef.current = authEndpoint;
  const getBalanceRef = useRef(getBalance);
  getBalanceRef.current = getBalance;

  const handshakeRef = useRef<() => Promise<boolean>>(async () => false);

  const client = useMemo(
    () =>
      new PublicClient({
        publishableKey,
        apiBaseUrl,
        onUnauthorized: () => handshakeRef.current(),
      }),
    [publishableKey, apiBaseUrl],
  );

  const [systemScheme, setSystemScheme] = useState<'light' | 'dark' | null>(
    getSystemScheme,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSystemScheme(mq.matches ? 'dark' : 'light');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const theme: JazaTheme = useMemo(
    () => resolveTheme(themePreference, systemScheme),
    [themePreference, systemScheme],
  );

  useEffect(() => {
    applyThemeCssVars(theme);
  }, [theme]);

  const [locale, setLocaleState] = useState<JazaLocale>(localeProp);
  useEffect(() => {
    setLocaleState(localeProp);
  }, [localeProp]);
  const setLocale = useCallback((next: JazaLocale) => {
    setLocaleState(next);
  }, []);

  const [status, setStatus] = useState<JazaAuthStatus>(
    useSessionAuth ? 'INITIALIZING' : 'AUTHENTICATED',
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [features, setFeatures] = useState<InitFeature[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [ledgerRevision, setLedgerRevision] = useState(0);

  const bumpLedgerRevision = useCallback(() => {
    setLedgerRevision((n) => n + 1);
  }, []);

  const applyInitResult = useCallback(
    (result: InitResult) => {
      client.setSessionToken(result.sessionToken);
      setFeatures(result.features ?? []);
      setBalance(result.wallet.balanceCredits);
      setStatus('AUTHENTICATED');
      setAuthError(null);
      setBalanceError(null);
    },
    [client],
  );

  const runHandshake = useCallback(async (): Promise<boolean> => {
    try {
      let result: InitResult;
      if (getSessionRef.current) {
        result = await getSessionRef.current();
      } else if (authEndpointRef.current) {
        result = await fetchSessionFromEndpoint(authEndpointRef.current);
      } else {
        return false;
      }
      applyInitResult(result);
      return true;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Jaza session handshake failed');
      client.setSessionToken(null);
      setFeatures([]);
      setBalance(null);
      setAuthError(error.message);
      setStatus('UNAUTHENTICATED');
      onAuthErrorRef.current?.(error);
      return false;
    }
  }, [applyInitResult, client]);

  handshakeRef.current = runHandshake;

  const refreshBalance = useCallback(async () => {
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      if (useSessionAuth) {
        if (!client.getSessionToken()) {
          const ok = await runHandshake();
          if (!ok) {
            setBalanceError('Not authenticated');
            return;
          }
        }
        const wallet = await client.getWallet();
        setBalance(wallet.balanceCredits);
        setStatus('AUTHENTICATED');
      } else {
        const value = await getBalanceRef.current!();
        setBalance(value);
      }
    } catch (err) {
      setBalanceError(
        err instanceof Error ? err.message : 'Failed to load balance',
      );
      if (
        useSessionAuth &&
        err instanceof JazaSdkError &&
        err.statusCode === 401
      ) {
        setStatus('UNAUTHENTICATED');
      }
    } finally {
      setBalanceLoading(false);
    }
  }, [client, runHandshake, useSessionAuth]);

  const notifyWalletChanged = useCallback(async () => {
    await refreshBalance();
    bumpLedgerRevision();
  }, [bumpLedgerRevision, refreshBalance]);

  useEffect(() => {
    if (useSessionAuth) return;
    void refreshBalance();
  }, [useSessionAuth, refreshBalance]);

  useEffect(() => {
    if (!useSessionAuth) return;
    let cancelled = false;
    void (async () => {
      setStatus('INITIALIZING');
      const ok = await runHandshake();
      if (cancelled) return;
      if (!ok) {
        setStatus((s) => (s === 'AUTHENTICATED' ? s : 'UNAUTHENTICATED'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [runHandshake, useSessionAuth]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [topUpSource, setTopUpSource] = useState<TopUpSource>('topup');
  const [paywallFeatureCode, setPaywallFeatureCode] = useState<string | null>(
    null,
  );
  const [step, setStep] = useState<TopUpStep>('offer');
  const [resultPhase, setResultPhase] = useState<ResultPhase>('loading');
  const [topUpToken, setTopUpToken] = useState<string | null>(null);

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundlesError, setBundlesError] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  const [countries, setCountries] = useState<EnrichedCountry[]>([]);
  const [selectedCountry, setSelectedCountryState] =
    useState<EnrichedCountry | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<
    string | null
  >(null);

  const [phoneNational, setPhoneNational] = useState('');
  const [predict, setPredict] = useState<PredictProviderResponse | null>(
    null,
  );
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const [quote, setQuote] = useState<QuotePaymentResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [deposit, setDeposit] = useState<PublicDeposit | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  const predictTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStarted = useRef<number | null>(null);

  const clearPoll = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    pollStarted.current = null;
  }, []);

  const resetPaymentState = useCallback(() => {
    setPredict(null);
    setPredictError(null);
    setQuote(null);
    setQuoteError(null);
    setDeposit(null);
    setDepositError(null);
    setFailureReason(null);
    setResultPhase('loading');
  }, []);

  const setSelectedCountry = useCallback((country: EnrichedCountry | null) => {
    setSelectedCountryState(country);
    setPhoneNational('');
    setPredict(null);
    setPredictError(null);
    if (country && country.currencies.length > 0) {
      const codes = country.currencies.map((c) => c.code);
      setSelectedCurrencyCode(pickDefaultCurrencyCode(codes));
    } else {
      setSelectedCurrencyCode(null);
    }
  }, []);

  const loadSessionData = useCallback(async () => {
    setBundlesLoading(true);
    setBundlesError(null);
    try {
      const [bundleList, catalogCountries] = await Promise.all([
        client.listBundles(),
        client.listCountries(),
      ]);
      const active = bundleList
        .filter((b) => b.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setBundles(active);
      if (active.length > 0) {
        setSelectedBundle(active[0]!);
      } else {
        setSelectedBundle(null);
      }
      const enriched = enrichCountries(catalogCountries);
      setCountries(enriched);
      if (enriched.length > 0) {
        setSelectedCountryState((prev) => {
          if (prev) return prev;
          return enriched.find((c) => c.iso2 === 'CD') ?? enriched[0]!;
        });
        setSelectedCurrencyCode((prev) => {
          if (prev) return prev;
          const country =
            enriched.find((c) => c.iso2 === 'CD') ?? enriched[0]!;
          const codes = country.currencies.map((c) => c.code);
          return pickDefaultCurrencyCode(codes);
        });
      }
    } catch (err) {
      setBundles([]);
      setSelectedBundle(null);
      setBundlesError(
        err instanceof Error ? err.message : 'Failed to load bundles',
      );
    } finally {
      setBundlesLoading(false);
    }
  }, [client]);

  const openTopUpInternal = useCallback(
    async (source: TopUpSource, featureCode?: string | null) => {
      const session = await client.createTopUp();
      if (!session.token?.trim()) {
        throw new Error('Top-up session did not return a token');
      }
      const token = session.token.trim();
      client.setTopUpToken(token);
      setTopUpToken(token);
      setTopUpSource(source);
      setPaywallFeatureCode(
        source === 'paywall' ? featureCode?.trim() || null : null,
      );
      setStep('offer');
      resetPaymentState();
      setSelectedCountryState(null);
      setSelectedCurrencyCode(null);
      setPhoneNational('');
      setBundlesError(null);
      setSheetOpen(true);
      void loadSessionData();
      void refreshBalance();
    },
    [client, loadSessionData, refreshBalance, resetPaymentState],
  );

  const openTopUp = useCallback(async () => {
    await openTopUpInternal('topup');
  }, [openTopUpInternal]);

  const openPaywall = useCallback(
    async (opts?: { featureCode?: string }) => {
      await openTopUpInternal('paywall', opts?.featureCode);
    },
    [openTopUpInternal],
  );

  const getFeatureCostFn = useCallback(
    (featureCode: string) => lookupFeatureCost(features, featureCode),
    [features],
  );

  const canAffordFn = useCallback(
    (featureCodeOrCredits: string | number) =>
      canAffordFeature(balance, features, featureCodeOrCredits),
    [balance, features],
  );

  const closeTopUp = useCallback(() => {
    clearPoll();
    setSheetOpen(false);
    client.setTopUpToken(null);
    setTopUpToken(null);
    setTopUpSource('topup');
    setPaywallFeatureCode(null);
    setStep('offer');
    resetPaymentState();
  }, [clearPoll, client, resetPaymentState]);

  const closePaywall = useCallback(() => {
    closeTopUp();
  }, [closeTopUp]);

  const openPaywallRef = useRef(openPaywall);
  openPaywallRef.current = openPaywall;

  useEffect(() => {
    if (!useSessionAuth) return;
    if (status !== 'AUTHENTICATED') return;

    const realtime = new ClientRealtime({
      publishableKey,
      apiBaseUrl,
      getSessionToken: () => client.getSessionToken(),
      onPaywallInsufficient: () => {
        void openPaywallRef.current();
      },
    });
    realtime.connect();
    return () => realtime.disconnect();
  }, [apiBaseUrl, client, publishableKey, status, useSessionAuth]);

  const goToOffer = useCallback(() => {
    clearPoll();
    setStep('offer');
    resetPaymentState();
  }, [clearPoll, resetPaymentState]);

  const goToPayment = useCallback(() => {
    setStep('payment');
    resetPaymentState();
  }, [resetPaymentState]);

  const startPoll = useCallback(
    (depositId: string, credits: number) => {
      clearPoll();
      pollStarted.current = Date.now();
      pollTimer.current = setInterval(() => {
        void (async () => {
          if (
            pollStarted.current &&
            Date.now() - pollStarted.current > POLL_TIMEOUT_MS
          ) {
            clearPoll();
            setResultPhase('failure');
            setFailureReason('Payment timed out. Please try again.');
            return;
          }
          try {
            const updated = await client.getDeposit(depositId);
            setDeposit(updated);
            if (updated.status === 'COMPLETED') {
              clearPoll();
              setResultPhase('success');
              await refreshBalance();
              bumpLedgerRevision();
              onTopUpComplete?.({
                depositId: updated.id,
                credits,
                status: updated.status,
              });
            } else if (isDepositTerminal(updated.status)) {
              clearPoll();
              setResultPhase('failure');
              setFailureReason(
                updated.failureReason ??
                  `Payment ${updated.status.toLowerCase()}`,
              );
            }
          } catch {
            /* keep polling */
          }
        })();
      }, POLL_INTERVAL_MS);
    },
    [bumpLedgerRevision, clearPoll, client, onTopUpComplete, refreshBalance],
  );

  const submitDeposit = useCallback(async () => {
    if (!selectedBundle || !predict || !quote || !selectedCountry) return;
    const e164 = buildE164(selectedCountry.dialCode, phoneNational);
    setStep('processing');
    setResultPhase('loading');
    setDepositError(null);
    try {
      const created = await client.createDeposit({
        bundleId: selectedBundle.id,
        currencyCode: quote.currencyCode,
        paymentGatewayCode: predict.provider.code,
        phoneNumber: e164,
      });
      setDeposit(created);
      if (created.status === 'COMPLETED') {
        setResultPhase('success');
        await refreshBalance();
        bumpLedgerRevision();
        onTopUpComplete?.({
          depositId: created.id,
          credits: created.credits,
          status: created.status,
        });
        return;
      }
      if (isDepositTerminal(created.status)) {
        setResultPhase('failure');
        setFailureReason(
          created.failureReason ?? `Payment ${created.status.toLowerCase()}`,
        );
        return;
      }
      startPoll(created.id, created.credits);
    } catch (err) {
      setResultPhase('failure');
      setDepositError(
        err instanceof Error ? err.message : 'Failed to start payment',
      );
      setFailureReason(
        err instanceof Error ? err.message : 'Failed to start payment',
      );
    }
  }, [
    bumpLedgerRevision,
    client,
    onTopUpComplete,
    phoneNational,
    predict,
    quote,
    refreshBalance,
    selectedBundle,
    selectedCountry,
    startPoll,
  ]);

  const retryPayment = useCallback(() => {
    clearPoll();
    setStep('payment');
    setResultPhase('loading');
    setDepositError(null);
    setFailureReason(null);
  }, [clearPoll]);

  useEffect(() => {
    if (step !== 'payment' || !selectedCountry) return;
    const digits = phoneNational.replace(/\D/g, '');
    if (digits.length < 6) {
      setPredict(null);
      setPredictError(null);
      return;
    }
    if (predictTimer.current) clearTimeout(predictTimer.current);
    predictTimer.current = setTimeout(() => {
      void (async () => {
        setPredictLoading(true);
        setPredictError(null);
        try {
          const e164 = buildE164(selectedCountry.dialCode, phoneNational);
          const result = await client.predictProvider(e164);
          setPredict(result);
          const codes = result.currencies.map((c) => c.code);
          if (
            selectedCurrencyCode &&
            codes.includes(selectedCurrencyCode)
          ) {
            /* keep selection */
          } else {
            setSelectedCurrencyCode(pickDefaultCurrencyCode(codes));
          }
        } catch (err) {
          setPredict(null);
          setPredictError(
            err instanceof Error ? err.message : 'Could not detect provider',
          );
        } finally {
          setPredictLoading(false);
        }
      })();
    }, PREDICT_DEBOUNCE_MS);
    return () => {
      if (predictTimer.current) clearTimeout(predictTimer.current);
    };
  }, [
    client,
    phoneNational,
    selectedCountry,
    selectedCurrencyCode,
    step,
  ]);

  useEffect(() => {
    if (
      step !== 'payment' ||
      !selectedBundle ||
      !predict ||
      !selectedCurrencyCode
    ) {
      setQuote(null);
      return;
    }
    void (async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const q = await client.quotePayment({
          bundleId: selectedBundle.id,
          currencyCode: selectedCurrencyCode,
          paymentGatewayCode: predict.provider.code,
        });
        setQuote(q);
      } catch (err) {
        setQuote(null);
        setQuoteError(
          err instanceof Error ? err.message : 'Could not load quote',
        );
      } finally {
        setQuoteLoading(false);
      }
    })();
  }, [client, predict, selectedBundle, selectedCurrencyCode, step]);

  useEffect(() => () => clearPoll(), [clearPoll]);

  const value = useMemo(
    () => ({
      theme,
      themePreference,
      locale,
      setLocale,
      publishableKey,
      client,
      status,
      authError,
      balanceCredits: balance,
      balance,
      balanceLoading,
      balanceError,
      refreshBalance,
      ledgerRevision,
      notifyWalletChanged,
      features,
      getFeatureCost: getFeatureCostFn,
      canAfford: canAffordFn,
      paywallOpen: sheetOpen,
      openPaywall,
      closePaywall,
      sheetOpen,
      topUpSource,
      paywallFeatureCode,
      step,
      resultPhase,
      topUpToken,
      bundles,
      bundlesLoading,
      bundlesError,
      selectedBundle,
      setSelectedBundle,
      countries,
      selectedCountry,
      setSelectedCountry,
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
      deposit,
      depositError,
      failureReason,
      openTopUp,
      closeTopUp,
      goToOffer,
      goToPayment,
      submitDeposit,
      retryPayment,
      onTopUpComplete,
    }),
    [
      theme,
      themePreference,
      locale,
      setLocale,
      publishableKey,
      client,
      status,
      authError,
      balance,
      balanceLoading,
      balanceError,
      refreshBalance,
      ledgerRevision,
      notifyWalletChanged,
      features,
      getFeatureCostFn,
      canAffordFn,
      sheetOpen,
      topUpSource,
      paywallFeatureCode,
      step,
      resultPhase,
      topUpToken,
      bundles,
      bundlesLoading,
      bundlesError,
      selectedBundle,
      countries,
      selectedCountry,
      setSelectedCountry,
      selectedCurrencyCode,
      phoneNational,
      predict,
      predictLoading,
      predictError,
      quote,
      quoteLoading,
      quoteError,
      deposit,
      depositError,
      failureReason,
      openTopUp,
      closeTopUp,
      openPaywall,
      closePaywall,
      goToOffer,
      goToPayment,
      submitDeposit,
      retryPayment,
      onTopUpComplete,
    ],
  );

  return (
    <JazaContext.Provider value={value}>
      {children}
      <TopUpDrawer />
    </JazaContext.Provider>
  );
}
