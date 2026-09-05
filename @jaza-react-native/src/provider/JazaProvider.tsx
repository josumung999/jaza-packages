import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Appearance } from 'react-native';
import { JazaSdkError } from '../api/errors.js';
import { PublicClient } from '../api/publicClient.js';
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
  resolveTheme,
  type JazaTheme,
  type ThemePreference,
} from '../theme/tokens.js';
import { JazaContext, type ResultPhase, type TopUpStep } from './JazaContext.js';
import { TopUpBottomSheet } from '../sheet/TopUpBottomSheet.js';

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
  onAuthError?: () => void;
  /**
   * @deprecated Prefer `getSession` / `authEndpoint`. Used only when neither is set.
   */
  getBalance?: () => Promise<number>;
  onTopUpComplete?: (result: TopUpCompleteResult) => void;
  theme?: ThemePreference;
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
    () => {
      const scheme = Appearance.getColorScheme();
      return scheme === 'dark' ? 'dark' : 'light';
    },
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const theme: JazaTheme = useMemo(
    () => resolveTheme(themePreference, systemScheme),
    [themePreference, systemScheme],
  );

  const [status, setStatus] = useState<JazaAuthStatus>(
    useSessionAuth ? 'INITIALIZING' : 'AUTHENTICATED',
  );
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
    } catch {
      client.setSessionToken(null);
      setFeatures([]);
      setBalance(null);
      setStatus('UNAUTHENTICATED');
      onAuthErrorRef.current?.();
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

  const openTopUp = useCallback(async () => {
    const session = await client.createTopUp();
    if (!session.token?.trim()) {
      throw new Error('Top-up session did not return a token');
    }
    const token = session.token.trim();
    client.setTopUpToken(token);
    setTopUpToken(token);
    setStep('offer');
    resetPaymentState();
    setSelectedCountryState(null);
    setSelectedCurrencyCode(null);
    setPhoneNational('');
    setBundlesError(null);
    setSheetOpen(true);
    void loadSessionData();
    void refreshBalance();
  }, [client, loadSessionData, refreshBalance, resetPaymentState]);

  const closeTopUp = useCallback(() => {
    clearPoll();
    setSheetOpen(false);
    client.setTopUpToken(null);
    setTopUpToken(null);
    setStep('offer');
    resetPaymentState();
  }, [clearPoll, client, resetPaymentState]);

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
      publishableKey,
      client,
      status,
      balanceCredits: balance,
      balance,
      balanceLoading,
      balanceError,
      refreshBalance,
      ledgerRevision,
      features,
      sheetOpen,
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
      publishableKey,
      client,
      status,
      balance,
      balanceLoading,
      balanceError,
      refreshBalance,
      ledgerRevision,
      features,
      sheetOpen,
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
      <TopUpBottomSheet />
    </JazaContext.Provider>
  );
}
