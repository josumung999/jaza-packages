import { HttpClient } from './client.js';
import { JazaError } from './errors.js';
import type {
  ConsumeParams,
  ConsumeResult,
  CreateCustomerParams,
  Customer,
  JazaConfig,
  TopUpSession,
} from './types.js';
import { DEFAULT_API_BASE_URL } from './version.js';

function assertConfig(config: JazaConfig): void {
  if (!config?.secretKey || typeof config.secretKey !== 'string') {
    throw new JazaError('secretKey is required', {
      statusCode: 0,
      code: 'invalid_config',
    });
  }
  if (!config.secretKey.includes('_sk_')) {
    throw new JazaError('secretKey must be a merchant secret key (jz_*_sk_*)', {
      statusCode: 0,
      code: 'invalid_config',
    });
  }
  if (!config?.publicKey || typeof config.publicKey !== 'string') {
    throw new JazaError('publicKey is required', {
      statusCode: 0,
      code: 'invalid_config',
    });
  }
  if (!config.publicKey.includes('_pk_')) {
    throw new JazaError('publicKey must be a merchant public key (jz_*_pk_*)', {
      statusCode: 0,
      code: 'invalid_config',
    });
  }
}

function assertCreateCustomer(params: CreateCustomerParams): void {
  if (!params?.name?.trim()) {
    throw new JazaError('name is required', {
      statusCode: 0,
      code: 'invalid_request',
    });
  }
  if (!params.email && !params.phoneNumber) {
    throw new JazaError('email or phoneNumber is required', {
      statusCode: 0,
      code: 'invalid_request',
    });
  }
}

function assertConsume(params: ConsumeParams): void {
  if (!params?.customerId?.trim()) {
    throw new JazaError('customerId is required', {
      statusCode: 0,
      code: 'invalid_request',
    });
  }
  if (!params.idempotencyKey?.trim()) {
    throw new JazaError('idempotencyKey is required', {
      statusCode: 0,
      code: 'invalid_request',
    });
  }
  const hasFeature = Boolean(params.featureCode);
  const hasCredits = params.credits !== undefined;
  if (!hasFeature && !hasCredits) {
    throw new JazaError('featureCode or credits is required', {
      statusCode: 0,
      code: 'invalid_request',
    });
  }
  if (hasFeature && hasCredits) {
    throw new JazaError('Provide featureCode or credits, not both', {
      statusCode: 0,
      code: 'invalid_request',
    });
  }
}

/**
 * Official Node.js client for Jaza.
 *
 * @example
 * ```ts
 * const jaza = new Jaza({ secretKey, publicKey });
 * const customer = await jaza.createCustomer({ name: 'Amina', email: 'a@x.com' });
 * const session = await jaza.topUp({ customerId: customer.id });
 * // hand session.token + publicKey to your frontend SDK
 * await jaza.consume({ customerId: customer.id, featureCode: 'SEND_MESSAGE', idempotencyKey: '...' });
 * await jaza.check({ topUpId: session.id });
 * ```
 */
export class Jaza {
  readonly publicKey: string;
  private readonly http: HttpClient;

  constructor(config: JazaConfig) {
    assertConfig(config);
    this.publicKey = config.publicKey;
    this.http = new HttpClient(
      config.apiBaseUrl ?? DEFAULT_API_BASE_URL,
      config.secretKey,
    );
  }

  /** Create a Stripe-like customer (`cus_…`) and zero-balance wallet. */
  createCustomer(params: CreateCustomerParams): Promise<Customer> {
    assertCreateCustomer(params);
    return this.http.request<Customer>('POST', '/v1/customers', {
      name: params.name,
      email: params.email,
      phoneNumber: params.phoneNumber,
    });
  }

  /** Issue a top-up session JWT for the frontend (bundles / future deposits). */
  topUp(params: { customerId: string }): Promise<TopUpSession> {
    if (!params?.customerId?.trim()) {
      throw new JazaError('customerId is required', {
        statusCode: 0,
        code: 'invalid_request',
      });
    }
    return this.http.request<TopUpSession>('POST', '/v1/top-ups', {
      customerId: params.customerId,
    });
  }

  /** Debit credits for a customer (feature code or raw credits). */
  consume(params: ConsumeParams): Promise<ConsumeResult> {
    assertConsume(params);
    return this.http.request<ConsumeResult>('POST', '/v1/credits/consume', {
      customerId: params.customerId,
      idempotencyKey: params.idempotencyKey,
      featureCode: params.featureCode,
      credits: params.credits,
      reason: params.reason,
    });
  }

  /** Check whether a top-up session completed (PENDING until PawaPay deposits land). */
  check(params: { topUpId: string }): Promise<TopUpSession> {
    if (!params?.topUpId?.trim()) {
      throw new JazaError('topUpId is required', {
        statusCode: 0,
        code: 'invalid_request',
      });
    }
    return this.http.request<TopUpSession>(
      'GET',
      `/v1/top-ups/${encodeURIComponent(params.topUpId)}`,
    );
  }
}
