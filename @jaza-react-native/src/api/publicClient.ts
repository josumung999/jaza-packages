import { JazaSdkError } from './errors.js';
import type {
  Bundle,
  CatalogCountry,
  ClientLedgerPage,
  ClientTopUpSession,
  ClientWallet,
  PredictProviderResponse,
  PublicDeposit,
  QuotePaymentResponse,
} from './types.js';
import { DEFAULT_API_BASE_URL, VERSION } from '../version.js';

export type PublicClientConfig = {
  apiBaseUrl?: string;
  publishableKey: string;
  /**
   * Called once when a client-session request returns 401.
   * Return true if a new session was established (caller may retry).
   */
  onUnauthorized?: () => Promise<boolean>;
};

export class PublicClient {
  private readonly apiBaseUrl: string;
  private readonly publishableKey: string;
  private topUpToken: string | null = null;
  private sessionToken: string | null = null;
  private onUnauthorized: (() => Promise<boolean>) | null = null;
  private unauthorizedInFlight: Promise<boolean> | null = null;

  constructor(config: PublicClientConfig) {
    this.apiBaseUrl = (config.apiBaseUrl ?? DEFAULT_API_BASE_URL).replace(
      /\/$/,
      '',
    );
    this.publishableKey = config.publishableKey;
    this.onUnauthorized = config.onUnauthorized ?? null;
  }

  setOnUnauthorized(handler: (() => Promise<boolean>) | null) {
    this.onUnauthorized = handler;
  }

  setTopUpToken(token: string | null) {
    this.topUpToken = token;
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  async listCountries(): Promise<CatalogCountry[]> {
    return this.request<CatalogCountry[]>('GET', '/v1/catalog/countries');
  }

  async listBundles(): Promise<Bundle[]> {
    return this.authedTopUpRequest<Bundle[]>('GET', '/v1/public/bundles');
  }

  async predictProvider(phoneNumber: string): Promise<PredictProviderResponse> {
    return this.authedTopUpRequest<PredictProviderResponse>(
      'POST',
      '/v1/public/payments/predict',
      { phoneNumber },
    );
  }

  async quotePayment(body: {
    bundleId: string;
    currencyCode: string;
    paymentGatewayCode: string;
  }): Promise<QuotePaymentResponse> {
    return this.authedTopUpRequest<QuotePaymentResponse>(
      'POST',
      '/v1/public/payments/quote',
      body,
    );
  }

  async createDeposit(body: {
    bundleId: string;
    currencyCode: string;
    paymentGatewayCode: string;
    phoneNumber: string;
    idempotencyKey?: string;
  }): Promise<PublicDeposit> {
    return this.authedTopUpRequest<PublicDeposit>(
      'POST',
      '/v1/public/payments/deposits',
      body,
    );
  }

  async getDeposit(paymentRequestId: string): Promise<PublicDeposit> {
    return this.authedTopUpRequest<PublicDeposit>(
      'GET',
      `/v1/public/payments/deposits/${paymentRequestId}`,
    );
  }

  /** Client session: current wallet balance for the session customer. */
  async getWallet(): Promise<ClientWallet> {
    return this.sessionRequest<ClientWallet>('GET', '/v1/client/wallet');
  }

  /** Client session: mint a short-lived top-up JWT for public MoMo routes. */
  async createTopUp(): Promise<ClientTopUpSession> {
    return this.sessionRequest<ClientTopUpSession>(
      'POST',
      '/v1/client/top-ups',
    );
  }

  /** Client session: paginated ledger. */
  async listLedger(opts?: {
    limit?: number;
    cursor?: string;
  }): Promise<ClientLedgerPage> {
    const params = new URLSearchParams();
    if (opts?.limit != null) params.set('limit', String(opts.limit));
    if (opts?.cursor) params.set('cursor', opts.cursor);
    const qs = params.toString();
    return this.sessionRequest<ClientLedgerPage>(
      'GET',
      `/v1/client/ledger${qs ? `?${qs}` : ''}`,
    );
  }

  private async authedTopUpRequest<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.topUpToken) {
      throw new JazaSdkError(401, 'Top-up session token is not set');
    }
    return this.request<T>(method, path, body, this.topUpToken);
  }

  private async sessionRequest<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    allowRetry = true,
  ): Promise<T> {
    if (!this.sessionToken) {
      throw new JazaSdkError(401, 'Client session token is not set');
    }
    try {
      return await this.request<T>(method, path, body, this.sessionToken);
    } catch (err) {
      if (
        allowRetry &&
        err instanceof JazaSdkError &&
        err.statusCode === 401 &&
        this.onUnauthorized
      ) {
        if (!this.unauthorizedInFlight) {
          this.unauthorizedInFlight = this.onUnauthorized().finally(() => {
            this.unauthorizedInFlight = null;
          });
        }
        const recovered = await this.unauthorizedInFlight;
        if (recovered && this.sessionToken) {
          return this.sessionRequest<T>(method, path, body, false);
        }
      }
      throw err;
    }
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    token?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': `@jazadev/react-native/${VERSION}`,
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['X-Jaza-Public-Key'] = this.publishableKey;
    }
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = { message: text };
      }
    }

    if (!response.ok) {
      throw JazaSdkError.fromResponse(response.status, parsed);
    }

    return parsed as T;
  }
}
