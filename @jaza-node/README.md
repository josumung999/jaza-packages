# `@jaza/node`

Official Node.js backend SDK for [Jaza](https://jaza.dev) prepaid / metered billing.

## Install

```bash
npm install @jaza/node
```

## Quickstart

```ts
import { Jaza } from '@jaza/node';

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

// 2. Issue a top-up JWT for your frontend SDK
const session = await jaza.topUp({ customerId: customer.id });
// Pass session.token + jaza.publicKey to the client.
// Frontend: X-Jaza-Public-Key + Authorization: Bearer <token>
// → GET /v1/public/bundles (PawaPay deposits come later)

// 3. Meter usage
await jaza.consume({
  customerId: customer.id,
  featureCode: 'SEND_MESSAGE',
  idempotencyKey: `msg_${Date.now()}`,
});

// 4. Poll top-up session status
const status = await jaza.check({ topUpId: session.id });
console.log(status.status); // PENDING until deposits complete
```

## API surface

| Method | Description |
|--------|-------------|
| `createCustomer({ name, email?, phoneNumber? })` | Returns `cus_…` |
| `topUp({ customerId })` | Returns session + JWT `token` |
| `consume({ customerId, featureCode \| credits, idempotencyKey })` | Debit wallet |
| `check({ topUpId })` | Session status |

Errors throw `JazaError` with `statusCode`, `code`, and `raw`.

## License

MIT
