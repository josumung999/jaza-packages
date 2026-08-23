import { Jaza } from '@jazadev/node';

let client: Jaza | null = null;

export function getJazaServer(): Jaza {
  if (client) return client;

  const secretKey = process.env.JAZA_SECRET_KEY;
  const publicKey = process.env.EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY;

  if (!secretKey || !publicKey) {
    throw new Error(
      'Set JAZA_SECRET_KEY and EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY in example/.env',
    );
  }

  client = new Jaza({
    secretKey,
    publicKey,
    apiBaseUrl: process.env.JAZA_API_BASE_URL,
  });

  return client;
}
