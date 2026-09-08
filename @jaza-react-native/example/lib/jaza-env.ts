export type JazaEnv = 'test' | 'live';

/** Derive sandbox/live from the merchant secret key prefix. */
export function getCurrentJazaEnv(
  secretKey = process.env.JAZA_SECRET_KEY,
): JazaEnv {
  if (secretKey?.startsWith('jz_live_')) return 'live';
  if (secretKey?.startsWith('jz_test_')) return 'test';
  throw new Error(
    'JAZA_SECRET_KEY must start with jz_test_ or jz_live_ to detect environment',
  );
}
