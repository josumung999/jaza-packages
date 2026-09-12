# @jazadev/react

Official **React web** SDK for Jaza — client session handshake, credit balance, Mobile Money top-up drawer, ledger, and action gating. Works with **Next.js**, **Remix**, **Vite**, and other React setups.

Peers: `react`, `react-dom`, `@base-ui/react` (responsive Drawer only — no Tailwind/shadcn required).

## Install

```bash
npm install @jazadev/react @base-ui/react
```

Import styles once in your app root:

```ts
import '@jazadev/react/styles.css';
```

On iOS Safari, Base UI drawers work best with a positioned body:

```css
body {
  position: relative;
}
```

## Quick start

### 1. Host handshake (Node)

```ts
import { Jaza } from '@jazadev/node';

const jaza = new Jaza({
  secretKey: process.env.JAZA_SECRET_KEY!,
  publicKey: process.env.JAZA_PUBLIC_KEY!,
});

// POST /api/jaza/init
export async function POST(req: Request) {
  const customerId = /* from your session */ '';
  const result = await jaza.init({ customerId });
  return Response.json(result);
}
```

### 2. Provider (client component)

**Next.js App Router** — put this in a Client Component (`'use client'`). Do not import the SDK from a Server Component.

```tsx
'use client';

import {
  JazaProvider,
  JazaBalance,
  JazaTopUpButton,
  JazaLedger,
  JazaActionButton,
  type InitResult,
} from '@jazadev/react';
import '@jazadev/react/styles.css';

export function BillingShell({ children }: { children: React.ReactNode }) {
  return (
    <JazaProvider
      publishableKey={process.env.NEXT_PUBLIC_JAZA_PUBLISHABLE_KEY!}
      getSession={async () => {
        const res = await fetch('/api/jaza/init', { method: 'POST' });
        if (!res.ok) throw new Error('Jaza init failed');
        return (await res.json()) as InitResult;
      }}
      onAuthError={(error) => {
        console.warn('Jaza session failed', error.message);
      }}
      theme="system"
    >
      {children}
    </JazaProvider>
  );
}
```

**Remix / Vite** — same pattern; no `'use client'` needed unless you use RSC.

### 3. Widgets

```tsx
<>
  <JazaBalance />
  <JazaTopUpButton />
  <JazaLedger mode="preview" limit={5} />
  <JazaActionButton
    featureCode="SEND_MESSAGE"
    onPress={async () => {
      await fetch('/api/consume', { method: 'POST' });
    }}
  />
</>
```

## Top-up UI

The checkout surface is a **Base UI Drawer**:

- **Mobile** (≤767px): slides up from the bottom (`swipeDirection="down"`)
- **Desktop / tablet**: slides in from the right (`swipeDirection="right"`)

Hosts do not copy shadcn Sheet/Drawer files — styling uses Jaza CSS variables injected by `JazaProvider`.

## API surface

| Export | Description |
|--------|-------------|
| `JazaProvider` / `useJaza` | Session handshake + top-up state |
| `JazaBalance` | Credit balance (render props supported) |
| `JazaTopUpButton` | Opens MoMo checkout |
| `JazaActionButton` | Gates by `featureCode`; opens paywall when unaffordable |
| `JazaLedger` | Wallet activity (`preview` \| `scroll`) |
| `PublicClient` | Low-level publishable-key HTTP client |
| `lightTheme` / `darkTheme` | Token objects |

Never call `consume` from the browser — debit on your server with `@jazadev/node`.

## Sandbox → live

Customer ids are environment-scoped. When switching `jz_test_*` → `jz_live_*`, remint with `createCustomer` and overwrite your host DB. See [Authentication](https://docs.jaza.dev/guides/authentication).

## Example

See [`example/`](./example) for a **Next.js** sample with the same flow as the Expo demo (sign-in, `jaza.init`, top-up drawer, consume) using App Router API routes — no external BFF required.
