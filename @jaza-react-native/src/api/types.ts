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
