import { JazaSdkError } from './errors.js';
import type {
  Bundle,
  CatalogCountry,
  PredictProviderResponse,
  PublicDeposit,
  QuotePaymentResponse,
} from './types.js';
import { DEFAULT_API_BASE_URL, VERSION } from '../version.js';

export type PublicClientConfig = {
  apiBaseUrl?: string;
  publishableKey: string;
};

export class PublicClient {
  private readonly apiBaseUrl: string;
  private readonly publishableKey: string;
  private topUpToken: string | null = null;

  constructor(config: PublicClientConfig) {
    this.apiBaseUrl = (config.apiBaseUrl ?? DEFAULT_API_BASE_URL).replace(
      /\/$/,
      '',
    );
    this.publishableKey = config.publishableKey;
  }

  setTopUpToken(token: string | null) {
    this.topUpToken = token;
  }

  async listCountries(): Promise<CatalogCountry[]> {
    return this.request<CatalogCountry[]>('GET', '/v1/catalog/countries');
  }

  async listBundles(): Promise<Bundle[]> {
    return this.authedRequest<Bundle[]>('GET', '/v1/public/bundles');
  }

  async predictProvider(phoneNumber: string): Promise<PredictProviderResponse> {
    return this.authedRequest<PredictProviderResponse>(
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
    return this.authedRequest<QuotePaymentResponse>(
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
    return this.authedRequest<PublicDeposit>(
      'POST',
      '/v1/public/payments/deposits',
      body,
    );
  }

  async getDeposit(paymentRequestId: string): Promise<PublicDeposit> {
    return this.authedRequest<PublicDeposit>(
      'GET',
      `/v1/public/payments/deposits/${paymentRequestId}`,
    );
  }

  private async authedRequest<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    if (!this.topUpToken) {
      throw new JazaSdkError(401, 'Top-up session token is not set');
    }
    return this.request<T>(method, path, body, this.topUpToken);
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
