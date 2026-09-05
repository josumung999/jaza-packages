import { afterEach, describe, expect, it, vi } from 'vitest';
import type { InitResult } from './types.js';
import { PublicClient } from './publicClient.js';

/**
 * Light handshake unit tests without React Native renderer.
 * Mirrors JazaProvider session apply + re-auth behavior via PublicClient.
 */
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function sampleInit(overrides?: Partial<InitResult>): InitResult {
  return {
    sessionToken: 'sess.a',
    expiresAt: '2099-01-01T00:00:00.000Z',
    customerId: 'cus_1',
    wallet: { balanceCredits: 40 },
    features: [{ code: 'SEND_MSG', creditsCost: 5, name: 'Send' }],
    ledger: { items: [], nextCursor: null },
    ...overrides,
  };
}

describe('session handshake helpers', () => {
  it('applies InitResult onto PublicClient and reads wallet', async () => {
    const init = sampleInit();
    const client = new PublicClient({
      publishableKey: 'jz_test_pk_x',
      apiBaseUrl: 'https://api.jaza.dev',
    });
    client.setSessionToken(init.sessionToken);

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ balanceCredits: init.wallet.balanceCredits }),
            { status: 200 },
          ),
      ),
    );

    const wallet = await client.getWallet();
    expect(wallet.balanceCredits).toBe(40);
    expect(client.getSessionToken()).toBe('sess.a');
  });

  it('re-handshake on 401 updates token before retry', async () => {
    let token = 'sess.stale';
    const getSession = vi.fn(async () =>
      sampleInit({ sessionToken: 'sess.fresh', wallet: { balanceCredits: 99 } }),
    );

    const client = new PublicClient({
      publishableKey: 'jz_test_pk_x',
      apiBaseUrl: 'https://api.jaza.dev',
      onUnauthorized: async () => {
        const next = await getSession();
        token = next.sessionToken;
        client.setSessionToken(token);
        return true;
      },
    });
    client.setSessionToken(token);

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        const auth = new Headers(init?.headers).get('Authorization');
        if (auth === 'Bearer sess.stale') {
          return new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
          });
        }
        return new Response(JSON.stringify({ balanceCredits: 99 }), {
          status: 200,
        });
      }),
    );

    const wallet = await client.getWallet();
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(wallet.balanceCredits).toBe(99);
    expect(client.getSessionToken()).toBe('sess.fresh');
  });
});
