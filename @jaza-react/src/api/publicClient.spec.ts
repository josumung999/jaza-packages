import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicClient } from './publicClient.js';
import { JazaSdkError } from './errors.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('PublicClient session auth', () => {
  it('getWallet sends session token and publishable key', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('Authorization')).toBe('Bearer sess.jwt');
      expect(headers.get('X-Jaza-Public-Key')).toBe('jz_test_pk_x');
      return new Response(JSON.stringify({ balanceCredits: 42 }), {
        status: 200,
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new PublicClient({
      publishableKey: 'jz_test_pk_x',
      apiBaseUrl: 'https://api.jaza.dev',
    });
    client.setSessionToken('sess.jwt');
    const wallet = await client.getWallet();
    expect(wallet.balanceCredits).toBe(42);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.jaza.dev/v1/client/wallet',
      expect.any(Object),
    );
  });

  it('getWallet without session throws 401', async () => {
    const client = new PublicClient({ publishableKey: 'jz_test_pk_x' });
    await expect(client.getWallet()).rejects.toMatchObject({
      statusCode: 401,
      message: 'Client session token is not set',
    });
  });

  it('401 triggers onUnauthorized once then retries', async () => {
    let calls = 0;
    const onUnauthorized = vi.fn(async () => {
      client.setSessionToken('sess.refresh');
      return true;
    });

    const client = new PublicClient({
      publishableKey: 'jz_test_pk_x',
      apiBaseUrl: 'https://api.jaza.dev',
      onUnauthorized,
    });
    client.setSessionToken('sess.old');

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        calls += 1;
        const headers = new Headers(init?.headers);
        if (headers.get('Authorization') === 'Bearer sess.old') {
          return new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
          });
        }
        expect(headers.get('Authorization')).toBe('Bearer sess.refresh');
        return new Response(JSON.stringify({ balanceCredits: 7 }), {
          status: 200,
        });
      }),
    );

    const wallet = await client.getWallet();
    expect(wallet.balanceCredits).toBe(7);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(calls).toBe(2);
  });

  it('401 without recovery surfaces JazaSdkError', async () => {
    const client = new PublicClient({
      publishableKey: 'jz_test_pk_x',
      onUnauthorized: async () => false,
    });
    client.setSessionToken('sess.old');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
          }),
      ),
    );

    await expect(client.getWallet()).rejects.toBeInstanceOf(JazaSdkError);
  });

  it('createTopUp POSTs with session token and returns top-up JWT', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe('https://api.jaza.dev/v1/client/top-ups');
      expect(init?.method).toBe('POST');
      const headers = new Headers(init?.headers);
      expect(headers.get('Authorization')).toBe('Bearer sess.jwt');
      expect(headers.get('X-Jaza-Public-Key')).toBe('jz_test_pk_x');
      return new Response(
        JSON.stringify({
          id: 'tu_1',
          customerId: 'cus_1',
          status: 'PENDING',
          token: 'topup.jwt',
          expiresAt: '2026-09-05T13:00:00.000Z',
          createdAt: '2026-09-05T12:00:00.000Z',
          updatedAt: '2026-09-05T12:00:00.000Z',
        }),
        { status: 201 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new PublicClient({
      publishableKey: 'jz_test_pk_x',
      apiBaseUrl: 'https://api.jaza.dev',
    });
    client.setSessionToken('sess.jwt');
    const session = await client.createTopUp();
    expect(session.token).toBe('topup.jwt');
    expect(session.id).toBe('tu_1');
  });

  it('createTopUp without session throws before fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const client = new PublicClient({ publishableKey: 'jz_test_pk_x' });
    await expect(client.createTopUp()).rejects.toMatchObject({
      statusCode: 401,
      message: 'Client session token is not set',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('listLedger sends limit and cursor query params', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(
        'https://api.jaza.dev/v1/client/ledger?limit=5&cursor=abc',
      );
      expect(init?.method).toBe('GET');
      const headers = new Headers(init?.headers);
      expect(headers.get('Authorization')).toBe('Bearer sess.jwt');
      return new Response(
        JSON.stringify({
          items: [
            {
              id: 'le_1',
              type: 'TOP_UP',
              credits: 100,
              provider: 'M-Pesa',
              createdAt: '2026-09-05T12:00:00.000Z',
            },
          ],
          nextCursor: null,
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new PublicClient({
      publishableKey: 'jz_test_pk_x',
      apiBaseUrl: 'https://api.jaza.dev',
    });
    client.setSessionToken('sess.jwt');
    const page = await client.listLedger({ limit: 5, cursor: 'abc' });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.credits).toBe(100);
  });
});
