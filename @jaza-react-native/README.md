# `@jazadev/react-native`

Official React Native / Expo SDK for Jaza.

Use this in your **mobile app** with your publishable key (`jz_*_pk_*`) and a short-lived top-up token from **your backend**. Never put your secret key in the app.

Server-side calls (create customer, issue top-up JWT, read balance) use [`@jazadev/node`](https://www.npmjs.com/package/@jazadev/node) or any HTTP client with your secret key.

---

## 1. Install

```bash
npm install @jazadev/react-native
```

Install peer dependencies (Expo):

```bash
npx expo install react react-native react-native-reanimated react-native-gesture-handler react-native-safe-area-context @gorhom/bottom-sheet @expo/vector-icons
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

Wrap your app with three providers, outermost first:

1. `GestureHandlerRootView` — gestures for bottom sheets  
2. `BottomSheetModalProvider` — modal sheet host  
3. `JazaProvider` — Jaza state, theme, and checkout sheet  

`getBalance` is defined here once; `JazaBalanceWidget` and the offer step both use it.

### Expo Router (`app/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { JazaProvider } from '@jazadev/react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <JazaProvider
          publishableKey={process.env.EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY!}
          getBalance={async () => {
            const res = await fetch(`${API_BASE}/jaza/balance`, {
              credentials: 'include',
            });
            const data = await res.json();
            return data.balanceCredits as number;
          }}
          onTopUpComplete={({ credits }) => {
            console.log('Top-up completed', credits);
          }}
          theme="system"
        >
          <Stack />
        </JazaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
```

### Alternative: classic `App.tsx`

Same wrappers; replace `<Stack />` with your navigation tree or screen components.

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { JazaProvider } from '@jazadev/react-native';
import { HomeScreen } from './screens/HomeScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <JazaProvider
          publishableKey={process.env.EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY!}
          getBalance={async () => {
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/jaza/balance`);
            return (await res.json()).balanceCredits;
          }}
          theme="system"
        >
          <HomeScreen />
        </JazaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 4. Show balance — `JazaBalanceWidget`

Render on any screen inside `JazaProvider`. It calls `getBalance` on mount and after a successful top-up.

**`app/(tabs)/index.tsx`** (or your home screen)

```tsx
import { View } from 'react-native';
import { JazaBalanceWidget } from '@jazadev/react-native';

export default function HomeScreen() {
  return (
    <View style={{ padding: 20 }}>
      <JazaBalanceWidget />
    </View>
  );
}
```

**Your server** (uses `@jazadev/node` with the secret key):

```ts
import { Jaza } from '@jazadev/node';

const jaza = new Jaza({ secretKey: process.env.JAZA_SECRET_KEY!, publicKey: process.env.JAZA_PUBLIC_KEY! });

// GET /jaza/balance — resolve customerId from your auth session
app.get('/jaza/balance', async (req, res) => {
  const wallet = await jaza.getBalance({ customerId: req.user.jazaCustomerId });
  res.json({ balanceCredits: wallet.balanceCredits });
});
```

---

## 5. Top up — `JazaTopUpButton`

Add the button on the same screen (or elsewhere under `JazaProvider`). It does **not** open the sheet until `onRequestToken` returns a JWT.

```tsx
import { View } from 'react-native';
import { JazaBalanceWidget, JazaTopUpButton } from '@jazadev/react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

export default function HomeScreen() {
  return (
    <View style={{ padding: 20, gap: 16 }}>
      <JazaBalanceWidget />
      <JazaTopUpButton
        label="Top up credits"
        onRequestToken={async () => {
          const res = await fetch(`${API_BASE}/jaza/top-up-token`, {
            method: 'POST',
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Could not start top-up');
          const data = await res.json();
          return data.token as string;
        }}
      />
    </View>
  );
}
```

**Your server**:

```ts
// POST /jaza/top-up-token
app.post('/jaza/top-up-token', async (req, res) => {
  const session = await jaza.topUp({ customerId: req.user.jazaCustomerId });
  res.json({ token: session.token });
});
```

Optional props:

- `label` — button text (default: `"Top up credits"`)
- `style` — `ViewStyle` for the button container

`JazaProvider` also accepts `onTopUpComplete` for when a payment succeeds.

---

## 6. What happens after the user taps Top up

1. App calls your backend → you return a top-up JWT (`jaza.topUp`)
2. Bottom sheet opens → bundles and current balance
3. User picks a bundle → enters phone, country, currency → sees quote
4. User confirms → payment starts → SDK polls until success or failure
5. Balance refreshes via `getBalance`; sheet shows success or retry

---

## Exports

| Export | Description |
|--------|-------------|
| `JazaProvider` | Context, theme, sheet, API client |
| `JazaBalanceWidget` | Credits balance card |
| `JazaTopUpButton` | Opens sheet after `onRequestToken` |
| `useJaza` | Advanced access to sheet state |
| `PublicClient` | Low-level public API client |

---

## License

MIT
