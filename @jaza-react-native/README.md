# `@jazadev/react-native`

Official React Native / Expo SDK for Jaza.

This package runs in your **mobile app**. It uses your publishable key plus a short-lived top-up token from **your backend** — never your secret key.

## Install

```bash
npm install @jazadev/react-native
```

**Peer dependencies** (Expo):

```bash
npx expo install react react-native react-native-reanimated react-native-gesture-handler react-native-safe-area-context @gorhom/bottom-sheet @expo/vector-icons
```

## Backend vs app

| Layer | Package | Role |
|-------|---------|------|
| **Your server** | [`@jazadev/node`](https://www.npmjs.com/package/@jazadev/node) (optional) | Secret-key API: create customers, `topUp()`, `getBalance()`, consume |
| **Your app** | `@jazadev/react-native` | Public-key UI: bundles, checkout sheet, payment status |

The React Native SDK does **not** depend on `@jazadev/node`. Your app talks to **your** API; your server talks to Jaza with the secret key.

Example BFF for the provider’s `getBalance` callback:

```ts
// server
const wallet = await jaza.getBalance({ customerId });
return wallet.balanceCredits;
```

## App setup

Wrap your app root (required for bottom sheets + gestures):

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  JazaProvider,
  JazaBalanceWidget,
  JazaTopUpButton,
} from '@jazadev/react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <JazaProvider
          publishableKey="jz_test_pk_…"
          getBalance={async () => {
            const res = await fetch('https://your-api.example/wallet/balance');
            const data = await res.json();
            return data.balanceCredits as number;
          }}
          onTopUpComplete={({ credits }) => {
            console.log('Top-up done', credits);
          }}
          theme="system"
        >
          <JazaBalanceWidget />
          <JazaTopUpButton
            onRequestToken={async () => {
              const res = await fetch('https://your-api.example/top-up-token', {
                method: 'POST',
              });
              const data = await res.json();
              return data.token as string;
            }}
          />
        </JazaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
```

### Android keyboard

In `app.json` / `AndroidManifest`, use `android:windowSoftInputMode="adjustResize"` so the phone field stays visible when the keyboard opens (also enabled on the main sheet via `android_keyboardInputMode="adjustResize"`).

## Flow

1. User taps **Top up** → `onRequestToken()` calls **your backend** → your server returns a top-up JWT
2. Sheet opens → bundles + balance
3. User picks bundle → phone, country, currency → provider detection + local amount quote
4. User confirms → payment starts → poll until success or failure
5. Balance refreshes via your `getBalance()` callback

## Exports

| Export | Description |
|--------|-------------|
| `JazaProvider` | Context, theme, sheet, API client |
| `JazaBalanceWidget` | Credits balance card |
| `JazaTopUpButton` | Opens sheet after `onRequestToken` |
| `useJaza` | Advanced access to sheet state |
| `PublicClient` | Low-level public API client |

## License

MIT
