# `@jazadev/react-native`

Official React Native / Expo SDK for Jaza.

Use this in your **mobile app** with your publishable key (`jz_*_pk_*`) and a client session from **your backend** (`jaza.init` → `getSession` / `authEndpoint`). Never put your secret key in the app.

Server-side: [`@jazadev/node`](https://www.npmjs.com/package/@jazadev/node) — `init` for the handshake, `consume` for debits. The SDK mints short-lived top-up JWTs internally via `POST /v1/client/top-ups` (session-authenticated); apps never handle that token.

### Try the sample

A private Expo app lives in [`example/`](./example). It demos sign-in (local JSON + Jaza customer), balance, ledger, and top-up with Expo Router API routes. See [example/README.md](./example/README.md). It is **not** published with this package.

---

## 1. Install

```bash
npm install @jazadev/react-native
```

Install peer dependencies (Expo):

```bash
npx expo install react react-native react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens @gorhom/bottom-sheet @expo/vector-icons @shopify/flash-list
```

---

## 2. Expo config

Add this so the phone number field stays visible when the keyboard opens on Android (the SDK also sets `android_keyboardInputMode="adjustResize"` on the bottom sheet, but the Activity must resize too).

**`app.json`**

```json
{
  "expo": {
    "android": {
      "softwareKeyboardLayoutMode": "resize"
    }
  }
}
```

**`app.config.js`**

```js
export default {
  expo: {
    android: {
      softwareKeyboardLayoutMode: 'resize',
    },
  },
};
```

---

## 3. Provider setup (app root)

Wrap your app with these providers, outermost first:

1. `GestureHandlerRootView` — gestures for bottom sheets  
2. `JazaProvider` — Jaza state, theme, and checkout sheet  

(`BottomSheetModalProvider` is not required; the SDK uses React Native `Modal` + `@gorhom/bottom-sheet`.)

**Preferred:** pass `getSession` (or `authEndpoint`) so the SDK loads a client session via your host `jaza.init` route. The SDK then calls client routes (`/v1/client/wallet`, `/v1/client/ledger`, `/v1/client/top-ups`) with the session token + publishable key.  
**Legacy:** `getBalance` alone still works until you migrate.

### Expo Router (`app/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { JazaProvider, type InitResult } from '@jazadev/react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JazaProvider
        publishableKey={process.env.EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY!}
        getSession={async () => {
          const res = await fetch(`${API_BASE}/jaza/init`, {
            method: 'POST',
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Jaza init failed');
          return (await res.json()) as InitResult;
        }}
        onAuthError={(error) => {
          console.warn('Jaza session failed', error.message);
          // Navigate away before unmounting JazaProvider if screens call useJaza.
        }}
        onTopUpComplete={({ credits }) => {
          console.log('Top-up completed', credits);
        }}
        theme="system"
      >
        <Stack />
      </JazaProvider>
    </GestureHandlerRootView>
  );
}
```

Host route (Node):

```ts
// POST /jaza/init
const result = await jaza.init({ customerId: req.user.jazaCustomerId });
res.json(result);
```

### Alternative: classic `App.tsx`

Same wrappers; replace `<Stack />` with your navigation tree or screen components.

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { JazaProvider, type InitResult } from '@jazadev/react-native';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <JazaProvider
        publishableKey={process.env.EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY!}
        getSession={async () => {
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/jaza/init`, {
            method: 'POST',
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Jaza init failed');
          return (await res.json()) as InitResult;
        }}
        theme="system"
      >
        <HomeScreen />
      </JazaProvider>
    </GestureHandlerRootView>
  );
}
```

`useJaza()` exposes `status` (`INITIALIZING` | `AUTHENTICATED` | …) and `balanceCredits` after a successful handshake.

---

## 4. Show balance — `JazaBalance`

Render on any screen inside `JazaProvider`. Balance comes from the session snapshot / `GET /v1/client/wallet`.

```tsx
import { View } from 'react-native';
import { JazaBalance } from '@jazadev/react-native';

export default function HomeScreen() {
  return (
    <View style={{ padding: 20 }}>
      <JazaBalance />
    </View>
  );
}
```

Customize with children (render props):

```tsx
<JazaBalance>
  {({ balanceCredits, loading, error, refresh }) => (
    <MyBalance value={balanceCredits} busy={loading} onRetry={refresh} />
  )}
</JazaBalance>
```

`JazaBalanceWidget` remains as a deprecated alias of `JazaBalance`.

---

## 5. Top up — `JazaTopUpButton`

Opens the checkout sheet. The SDK mints a top-up JWT from the client session — no host `onRequestToken`.

```tsx
import { View } from 'react-native';
import { JazaBalance, JazaTopUpButton } from '@jazadev/react-native';

export default function HomeScreen() {
  return (
    <View style={{ padding: 20, gap: 16 }}>
      <JazaBalance />
      <JazaTopUpButton label="Top up credits" />
    </View>
  );
}
```

Customize with children:

```tsx
<JazaTopUpButton label="Buy credits">
  {({ onPress, loading, disabled, label, error }) => (
    <MyButton onPress={onPress} busy={loading} title={label} />
  )}
</JazaTopUpButton>
```

Optional props:

- `label` — button text (default: `"Top up credits"`)
- `style` — `ViewStyle` for the default button
- `children` — render-prop function for a custom control

`JazaProvider` also accepts `onTopUpComplete` for when a payment succeeds.

---

## 6. Ledger — `JazaLedger`

```tsx
import { JazaLedger } from '@jazadev/react-native';

// Dashboard preview (safe inside ScrollView)
<JazaLedger mode="preview" limit={5} />

// Full transactions screen
<JazaLedger mode="scroll" />
```

Customize rows with `ItemComponent` (props: `id`, `type`, `title`, `subtitle`, `credits`, `direction`, `statusLabel`, `createdAt`).

Requires peer `@shopify/flash-list` for `mode="scroll"`.

---

## 7. Gate actions — `JazaActionButton`

**Gate only.** Compares wallet balance to a dashboard `featureCode` cost. Insufficient → opens paywall (top-up sheet). Enough → runs your `onPress`, which must call **your** BFF → `jaza.consume` (secret key). The SDK never debits.

```tsx
<JazaActionButton
  featureCode="SEND_MESSAGE"
  label="Send message"
  onPress={async () => {
    await fetch(`${API}/messages`, { method: 'POST', credentials: 'include' });
  }}
/>
```

UI bypass ≠ free credits — always enforce `consume` on the host.

When consume fails with insufficient balance, Jaza also pushes `jaza.paywall.insufficient_credits` over `WS /v1/client/realtime` so the SDK can open the paywall.

---

## 8. What happens after the user taps Top up

1. SDK calls `POST /v1/client/top-ups` with the session token → short-lived top-up JWT (internal)
2. Bottom sheet opens → bundles and current balance
3. User picks a bundle → enters phone, country, currency → sees quote
4. User confirms → payment starts → SDK polls until success or failure
5. Balance refreshes via `GET /v1/client/wallet`; sheet shows success or retry

---

## Exports

| Export | Description |
|--------|-------------|
| `JazaProvider` | Context, theme, sheet, API client |
| `JazaBalance` | Credits balance card (+ children render props) |
| `JazaBalanceWidget` | Deprecated alias of `JazaBalance` |
| `JazaTopUpButton` | Opens sheet via session-minted top-up |
| `JazaLedger` | Transaction list (`preview` / `scroll`) |
| `JazaActionButton` | Feature gate (never consume) |
| `useJaza` | Advanced access to sheet / features / paywall |
| `PublicClient` | Low-level public / client API client |

---

## License

MIT
