import { JazaError, type Customer, type Jaza } from '@jazadev/node';
import type { JazaEnv } from './jaza-env';
import type { SampleUser } from './types';

export type EnsureCustomerResult = {
  customerId: string;
  reminted: boolean;
};

function isCustomerNotFound(err: unknown): boolean {
  return (
    err instanceof JazaError &&
    (err.statusCode === 404 ||
      err.code === 'not_found' ||
      /customer not found/i.test(err.message))
  );
}

/**
 * Ensure the host user's customerId exists in the current Jaza key environment.
 * Sandbox and live are isolated — a TEST `cus_…` is 404 under LIVE keys.
 * On mismatch / not found, createCustomer and return the new id (caller overwrites host DB).
 */
export async function ensureCustomerForCurrentEnv(params: {
  jaza: Pick<Jaza, 'getCustomer' | 'createCustomer'>;
  user: SampleUser;
  currentEnv: JazaEnv;
  email: string;
  phoneNumber: string;
}): Promise<EnsureCustomerResult> {
  const { jaza, user, currentEnv, email, phoneNumber } = params;
  const envMismatch = user.jazaEnv != null && user.jazaEnv !== currentEnv;

  if (!envMismatch && user.customerId) {
    try {
      await jaza.getCustomer(user.customerId);
      return { customerId: user.customerId, reminted: false };
    } catch (err) {
      if (!isCustomerNotFound(err)) throw err;
    }
  }

  const customer: Customer = await jaza.createCustomer({
    name: email.split('@')[0] || 'Sample user',
    email,
    phoneNumber,
  });

  return { customerId: customer.id, reminted: true };
}
