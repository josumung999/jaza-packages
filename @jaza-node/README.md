# `@jazadev/node`

Official Node.js backend SDK for [Jaza](https://jaza.dev) prepaid / metered billing.

## Install

```bash
npm install @jazadev/node
```

## Quickstart

```ts
import { Jaza } from '@jazadev/node';

const jaza = new Jaza({
  secretKey: process.env.JAZA_SECRET_KEY!, // jz_test_sk_…
  publicKey: process.env.JAZA_PUBLIC_KEY!, // jz_test_pk_…
  // apiBaseUrl: 'http://localhost:3001', // local jaza-api
});

// 1. Create a customer once; store customer.id in your DB
const customer = await jaza.createCustomer({
  name: 'Amina Okello',
  email: 'amina@example.com', // and/or phoneNumber
});

// 2. Host BFF: mint a client session for the mobile SDK (POST /api/jaza/init)
const init = await jaza.init({ customerId: customer.id });
// Return init to the app: sessionToken + wallet/features snapshot.
// The app pairs sessionToken with your publishable key for client routes.
// Consume still happens here on the server — never from the device.

// 3. Meter usage on billable host routes (secret key only)
await jaza.consume({
  customerId: customer.id,
  featureCode: 'SEND_MESSAGE',
  idempotencyKey: `msg_${Date.now()}`,
});

// Optional: server-minted top-up JWT (advanced). Prefer client session
// POST /v1/client/top-ups once the RN SDK uses init.
const session = await jaza.topUp({ customerId: customer.id });
await jaza.check({ topUpId: session.id });

const wallet = await jaza.getBalance({ customerId: customer.id });
console.log(wallet.balanceCredits);
```

## API surface

| Method | Description |
|--------|-------------|
| `createCustomer({ name, email?, phoneNumber? })` | Returns `cus_…` |
| `init({ customerId })` | Client session JWT + wallet/features/ledger snapshot |
| `topUp({ customerId })` | Top-up session + JWT `token` (advanced / legacy BFF) |
| `getBalance({ customerId })` | Wallet with `balanceCredits` |
| `consume({ customerId, featureCode \| credits, idempotencyKey })` | Debit wallet (server only) |
| `check({ topUpId })` | Session status |

Errors throw `JazaError` with `statusCode`, `code`, and `raw`.

## License

MIT
