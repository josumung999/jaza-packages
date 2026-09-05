export type Bundle = {
  id: string;
  appId: string;
  label: string | null;
  priceUsd: string;
  credits: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CatalogCurrency = {
  id: string;
  code: string;
  name: string;
  decimals: number;
  isActive: boolean;
};

export type CatalogCountry = {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  isActive: boolean;
  currencies?: Array<{ currency: CatalogCurrency }>;
  paymentGateways?: unknown[];
};

export type PredictProviderResponse = {
  provider: { code: string; displayName: string };
  countryIso3: string | null;
  currencies: Array<{ code: string; decimals: number }>;
  defaultCurrencyCode: string;
};

export type QuotePaymentResponse = {
  bundleId: string;
  credits: number;
  currencyCode: string;
  paymentGatewayCode: string;
  amountUsd: string;
  amountLocal: string;
  feeUsd: string;
  feeLocal: string;
  totalUsd: string;
  totalLocal: string;
};

export type DepositStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PublicDeposit = {
  id: string;
  status: DepositStatus;
  credits: number;
  currencyCode: string | null;
  paymentGatewayCode: string | null;
  amountUsd: string;
  amountLocal: string;
  feeUsd: string;
  feeLocal: string;
  totalUsd: string;
  totalLocal: string;
  bundleId: string | null;
  phoneNumber: string | null;
  providerRef: string | null;
  failureReason: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TopUpCompleteResult = {
  depositId: string;
  credits: number;
  status: DepositStatus;
};

export type InitFeature = {
  code: string;
  creditsCost: number;
  name?: string;
};

export type InitLedgerItem = {
  id: string;
  type: 'TOP_UP' | 'CONSUMPTION' | 'REFUND' | string;
  credits: number;
  description?: string;
  createdAt: string;
};

/** Snapshot from host `jaza.init` / `POST /v1/client/sessions` */
export type InitResult = {
  sessionToken: string;
  expiresAt: string;
  customerId: string;
  wallet: { balanceCredits: number };
  features: InitFeature[];
  ledger?: { items: InitLedgerItem[]; nextCursor?: string | null };
};

export type ClientWallet = {
  balanceCredits: number;
};

export type ClientTopUpSession = {
  id: string;
  customerId: string;
  status: string;
  token?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ClientLedgerPage = {
  items: InitLedgerItem[];
  nextCursor?: string | null;
};

export type JazaAuthStatus =
  | 'INITIALIZING'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'ERROR';
