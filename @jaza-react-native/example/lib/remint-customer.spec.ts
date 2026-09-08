import { describe, expect, it, vi } from 'vitest';
import { JazaError } from '@jazadev/node';
import { ensureCustomerForCurrentEnv } from './remint-customer';
import type { SampleUser } from './types';

const baseUser: SampleUser = {
  id: 'usr_1',
  email: 'a@example.com',
  phoneNumber: '+254700000000',
  customerId: 'cus_sandbox',
  jazaEnv: 'test',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('ensureCustomerForCurrentEnv', () => {
  it('reuses customer when getCustomer succeeds in the same env', async () => {
    const getCustomer = vi.fn(async () => ({ id: 'cus_sandbox' }));
    const createCustomer = vi.fn();

    const result = await ensureCustomerForCurrentEnv({
      jaza: { getCustomer, createCustomer } as never,
      user: baseUser,
      currentEnv: 'test',
      email: baseUser.email,
      phoneNumber: baseUser.phoneNumber,
    });

    expect(result).toEqual({ customerId: 'cus_sandbox', reminted: false });
    expect(createCustomer).not.toHaveBeenCalled();
  });

  it('remints when stored env mismatches current keys', async () => {
    const getCustomer = vi.fn();
    const createCustomer = vi.fn(async () => ({ id: 'cus_live' }));

    const result = await ensureCustomerForCurrentEnv({
      jaza: { getCustomer, createCustomer } as never,
      user: baseUser,
      currentEnv: 'live',
      email: baseUser.email,
      phoneNumber: baseUser.phoneNumber,
    });

    expect(result).toEqual({ customerId: 'cus_live', reminted: true });
    expect(getCustomer).not.toHaveBeenCalled();
    expect(createCustomer).toHaveBeenCalledWith({
      name: 'a',
      email: 'a@example.com',
      phoneNumber: '+254700000000',
    });
  });

  it('remints when getCustomer returns 404 in the same env', async () => {
    const getCustomer = vi.fn(async () => {
      throw new JazaError('Customer not found', {
        statusCode: 404,
        code: 'not_found',
      });
    });
    const createCustomer = vi.fn(async () => ({ id: 'cus_new' }));

    const result = await ensureCustomerForCurrentEnv({
      jaza: { getCustomer, createCustomer } as never,
      user: { ...baseUser, jazaEnv: 'live' },
      currentEnv: 'live',
      email: baseUser.email,
      phoneNumber: baseUser.phoneNumber,
    });

    expect(result).toEqual({ customerId: 'cus_new', reminted: true });
  });

  it('rethrows non-404 getCustomer errors', async () => {
    const getCustomer = vi.fn(async () => {
      throw new JazaError('boom', { statusCode: 500, code: 'api_error' });
    });

    await expect(
      ensureCustomerForCurrentEnv({
        jaza: { getCustomer, createCustomer: vi.fn() } as never,
        user: { ...baseUser, jazaEnv: 'live' },
        currentEnv: 'live',
        email: baseUser.email,
        phoneNumber: baseUser.phoneNumber,
      }),
    ).rejects.toMatchObject({ message: 'boom', statusCode: 500 });
  });
});
