export type JazaConfig = {
  /** Merchant secret key (`jz_test_sk_…` / `jz_live_sk_…`) */
  secretKey: string;
  /** Merchant public key (`jz_test_pk_…` / `jz_live_pk_…`) — pass to frontend with top-up JWTs */
  publicKey: string;
  /** Override API host (default `https://api.jaza.dev`) */
  apiBaseUrl?: string;
};

export type CreateCustomerParams = {
  name: string;
  email?: string;
  phoneNumber?: string;
};

export type Customer = {
  id: string;
  appId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TopUpSessionStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export type TopUpSession = {
  id: string;
  customerId: string;
  status: TopUpSessionStatus;
  /** Present on create (`topUp`); omit on `check` */
  token?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ConsumeParams = {
  customerId: string;
  idempotencyKey: string;
  featureCode?: string;
  credits?: number;
  reason?: string;
};

export type Wallet = {
  id: string;
  appId: string;
  externalUserId: string;
  customerId: string | null;
  balanceCredits: number;
  createdAt: string;
  updatedAt: string;
};

export type LedgerEntry = {
  id: string;
  direction: string;
  amountCredits: number;
  balanceAfter: number;
  reason: string;
  idempotencyKey: string;
  createdAt: string;
};

export type ConsumeResult = {
  wallet: Wallet;
  ledgerEntry: LedgerEntry;
};

export type JazaErrorBody = {
  message?: string;
  statusCode?: number;
  error?: string;
  errors?: unknown;
};
