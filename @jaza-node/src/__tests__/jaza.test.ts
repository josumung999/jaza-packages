import { afterEach, describe, expect, it, vi } from 'vitest';
import { Jaza, JazaError } from '../index.js';

const secretKey = 'jz_test_sk_abc123';
const publicKey = 'jz_test_pk_abc123';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockFetch(handler: (input: string, init?: RequestInit) => Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      return handler(url, init);
    }),
  );
}

describe('Jaza', () => {
  it('rejects invalid config', () => {
    expect(() => new Jaza({ secretKey: '', publicKey })).toThrow(JazaError);
    expect(
      () => new Jaza({ secretKey: 'jz_test_pk_x', publicKey }),
    ).toThrow(JazaError);
  });

  it('createCustomer posts and returns customer', async () => {
    mockFetch((url, init) => {
      expect(url).toBe('https://api.jaza.dev/v1/customers');
      expect(init?.method).toBe('POST');
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${secretKey}`,
      });
      return new Response(
        JSON.stringify({
          id: 'cus_1',
          appId: 'app_1',
          name: 'Amina',
          email: 'a@example.com',
          phoneNumber: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
        { status: 201 },
      );
    });

    const jaza = new Jaza({ secretKey, publicKey });
    const customer = await jaza.createCustomer({
      name: 'Amina',
      email: 'a@example.com',
    });
    expect(customer.id).toBe('cus_1');
  });

  it('createCustomer requires email or phone', async () => {
    const jaza = new Jaza({ secretKey, publicKey });
    expect(() => jaza.createCustomer({ name: 'Amina' })).toThrow(JazaError);
  });

  it('topUp returns token', async () => {
    mockFetch((url) => {
      expect(url).toBe('https://api.jaza.dev/v1/top-ups');
      return new Response(
        JSON.stringify({
          id: 'tup_1',
          customerId: 'cus_1',
          status: 'PENDING',
          token: 'jwt.token.here',
          expiresAt: '2026-01-01T00:30:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
        { status: 201 },
      );
    });

    const jaza = new Jaza({ secretKey, publicKey });
    const session = await jaza.topUp({ customerId: 'cus_1' });
    expect(session.token).toBe('jwt.token.here');
    expect(jaza.publicKey).toBe(publicKey);
  });

  it('getBalance returns wallet', async () => {
    mockFetch((url, init) => {
      expect(url).toBe('https://api.jaza.dev/v1/wallets/by-user/cus_1');
      expect(init?.method).toBe('GET');
      return new Response(
        JSON.stringify({
          id: 'w1',
          appId: 'a1',
          externalUserId: 'cus_1',
          customerId: 'cus_1',
          balanceCredits: 1250,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
        { status: 200 },
      );
    });

    const jaza = new Jaza({ secretKey, publicKey });
    const wallet = await jaza.getBalance({ customerId: 'cus_1' });
    expect(wallet.balanceCredits).toBe(1250);
    expect(wallet.customerId).toBe('cus_1');
  });

  it('getBalance requires customerId', () => {
    const jaza = new Jaza({ secretKey, publicKey });
    expect(() => jaza.getBalance({ customerId: '' })).toThrow(JazaError);
  });

  it('consume and check', async () => {
    mockFetch((url, init) => {
      if (url.endsWith('/v1/credits/consume')) {
        expect(init?.method).toBe('POST');
        return new Response(
          JSON.stringify({
            wallet: {
              id: 'w1',
              appId: 'a1',
              externalUserId: 'cus_1',
              customerId: 'cus_1',
              balanceCredits: 95,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
            ledgerEntry: {
              id: 'le1',
              direction: 'DEBIT',
              amountCredits: 5,
              balanceAfter: 95,
              reason: 'CONSUME',
              idempotencyKey: 'k1',
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          }),
          { status: 201 },
        );
      }
      expect(url).toBe('https://api.jaza.dev/v1/top-ups/tup_1');
      return new Response(
        JSON.stringify({
          id: 'tup_1',
          customerId: 'cus_1',
          status: 'PENDING',
          expiresAt: '2026-01-01T00:30:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
        { status: 200 },
      );
    });

    const jaza = new Jaza({
      secretKey,
      publicKey,
      apiBaseUrl: 'https://api.jaza.dev',
    });
    const consumed = await jaza.consume({
      customerId: 'cus_1',
      featureCode: 'SEND_MESSAGE',
      idempotencyKey: 'k1',
    });
    expect(consumed.wallet.balanceCredits).toBe(95);

    const checked = await jaza.check({ topUpId: 'tup_1' });
    expect(checked.status).toBe('PENDING');
  });

  it('maps 4xx to JazaError', async () => {
    mockFetch(() =>
      new Response(JSON.stringify({ message: 'Customer not found', error: 'Not Found' }), {
        status: 404,
      }),
    );

    const jaza = new Jaza({ secretKey, publicKey });
    await expect(jaza.topUp({ customerId: 'cus_missing' })).rejects.toMatchObject({
      name: 'JazaError',
      statusCode: 404,
      message: 'Customer not found',
    });
  });
});
