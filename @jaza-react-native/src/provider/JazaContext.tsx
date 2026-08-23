import { createContext, useContext } from 'react';
import type { PublicClient } from '../api/publicClient.js';
import type {
  Bundle,
  PredictProviderResponse,
  PublicDeposit,
  QuotePaymentResponse,
  TopUpCompleteResult,
} from '../api/types.js';
import type { EnrichedCountry } from '../utils/helpers.js';
import type { JazaTheme, ThemePreference } from '../theme/tokens.js';

export type TopUpStep = 'offer' | 'payment' | 'processing';

export type ResultPhase = 'loading' | 'success' | 'failure';

export type JazaContextValue = {
  theme: JazaTheme;
  themePreference: ThemePreference;
  publishableKey: string;
  client: PublicClient;
  balance: number | null;
  balanceLoading: boolean;
  balanceError: string | null;
  refreshBalance: () => Promise<void>;
  sheetOpen: boolean;
  step: TopUpStep;
  resultPhase: ResultPhase;
  topUpToken: string | null;
  bundles: Bundle[];
  bundlesLoading: boolean;
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
  openTopUp: (token: string) => Promise<void>;
  closeTopUp: () => void;
  goToOffer: () => void;
  goToPayment: () => void;
  submitDeposit: () => Promise<void>;
  retryPayment: () => void;
  onTopUpComplete?: (result: TopUpCompleteResult) => void;
};

export const JazaContext = createContext<JazaContextValue | null>(null);

export function useJaza(): JazaContextValue {
  const ctx = useContext(JazaContext);
  if (!ctx) {
    throw new Error('useJaza must be used within JazaProvider');
  }
  return ctx;
}
