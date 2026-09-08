import { createContext, useContext } from 'react';
import type { PublicClient } from '../api/publicClient.js';
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
import type { EnrichedCountry } from '../utils/helpers.js';
import type { JazaTheme, ThemePreference } from '../theme/tokens.js';
import type { JazaLocale } from '../i18n/types.js';

export type TopUpStep = 'offer' | 'payment' | 'processing';

export type ResultPhase = 'loading' | 'success' | 'failure';

/** Why the top-up sheet was opened */
export type TopUpSource = 'topup' | 'paywall';

export type JazaContextValue = {
  theme: JazaTheme;
  themePreference: ThemePreference;
  locale: JazaLocale;
  setLocale: (locale: JazaLocale) => void;
  publishableKey: string;
  client: PublicClient;
  /** Session handshake status (init / authEndpoint) */
  status: JazaAuthStatus;
  /** Last handshake failure message when status is UNAUTHENTICATED; otherwise null. */
  authError: string | null;
  /**
   * Credit balance. Prefer `balanceCredits`; `balance` is kept for existing widgets.
   */
  balanceCredits: number | null;
  balance: number | null;
  balanceLoading: boolean;
  balanceError: string | null;
  refreshBalance: () => Promise<void>;
  /**
   * Increments when wallet activity changes (e.g. successful top-up).
   * `JazaLedger` refetches when this value changes.
   */
  ledgerRevision: number;
  /** Notify widgets after host-side consume / wallet changes. */
  notifyWalletChanged: () => Promise<void>;
  /** Features from last init snapshot (empty until session auth) */
  features: InitFeature[];
  getFeatureCost: (featureCode: string) => number | null;
  canAfford: (featureCodeOrCredits: string | number) => boolean;
  /** Alias of sheet open — paywall is the top-up sheet in v1 */
  paywallOpen: boolean;
  openPaywall: (opts?: { featureCode?: string }) => Promise<void>;
  closePaywall: () => void;
  sheetOpen: boolean;
  /** `paywall` when opened due to insufficient credits; otherwise `topup`. */
  topUpSource: TopUpSource;
  /** Feature that triggered the paywall, when known. */
  paywallFeatureCode: string | null;
  step: TopUpStep;
  resultPhase: ResultPhase;
  topUpToken: string | null;
  bundles: Bundle[];
  bundlesLoading: boolean;
  bundlesError: string | null;
  selectedBundle: Bundle | null;
  setSelectedBundle: (b: Bundle | null) => void;
  countries: EnrichedCountry[];
  selectedCountry: EnrichedCountry | null;
  setSelectedCountry: (c: EnrichedCountry | null) => void;
  selectedCurrencyCode: string | null;
  setSelectedCurrencyCode: (code: string | null) => void;
  phoneNational: string;
  setPhoneNational: (v: string) => void;
  predict: PredictProviderResponse | null;
  predictLoading: boolean;
  predictError: string | null;
  quote: QuotePaymentResponse | null;
  quoteLoading: boolean;
  quoteError: string | null;
  deposit: PublicDeposit | null;
  depositError: string | null;
  failureReason: string | null;
  openTopUp: () => Promise<void>;
  closeTopUp: () => void;
  goToOffer: () => void;
  goToPayment: () => void;
  submitDeposit: () => Promise<void>;
  retryPayment: () => void;
  onTopUpComplete?: (result: TopUpCompleteResult) => void;
};

export type { InitResult, JazaAuthStatus };

export const JazaContext = createContext<JazaContextValue | null>(null);

export function useJaza(): JazaContextValue {
  const ctx = useContext(JazaContext);
  if (!ctx) {
    throw new Error('useJaza must be used within JazaProvider');
  }
  return ctx;
}
