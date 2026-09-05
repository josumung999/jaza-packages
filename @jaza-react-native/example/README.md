# Jaza React Native sample app

Private Expo demo for [`@jazadev/react-native`](../). **Not published to npm.** Demo-grade auth only (no OTP / passwords).

## What it shows

1. Sign in with email + phone → stored in `data/users.json`
2. First sign-in creates a Jaza customer via `@jazadev/node` and saves `customerId`
3. Home screen: `JazaBalanceWidget` + `JazaTopUpButton` (opens the SDK bottom sheet)

## Host BFF routes (`app/api/jaza/`)

| Route | Role |
|-------|------|
| `POST /api/jaza/init` | `jaza.init({ customerId })` → client session + snapshot (Step 3+) |
| `GET /api/jaza/balance` | Legacy `getBalance` for current Provider |
| `POST /api/jaza/top-up-token` | Legacy `topUp` JWT for current TopUpButton |

Demo auth: send `X-User-Id` (local user id). Keep the secret key in these routes only.

## Setup

From the monorepo root (`packages/`):

```bash
npm install
npm run build -w @jazadev/node -w @jazadev/react-native
```

In this folder:

```bash
cp .env.example .env
# fill JAZA_SECRET_KEY + EXPO_PUBLIC_JAZA_PUBLISHABLE_KEY
```

## Run

This sample targets **Expo SDK 57**. Use a **development build** (EAS) if your Expo Go client does not support that SDK yet.

```bash
# optional: rebuild SDK on change
npm run dev -w @jazadev/react-native

# from this directory — after an EAS development build is installed
npx expo start --dev-client
```

On a physical device, API routes are reached via the Metro host from `expo-constants` — phone and computer must be on the same network.

If Metro fails with `Unable to resolve "expo-modules-core"`, clear the cache and restart:

```bash
npx expo start --dev-client -c
```

The sample Metro config keeps hierarchical lookup enabled so nested Expo packages resolve under npm workspaces.

## Notes

- Secret key stays in Expo Router API routes (`app/api/**`); never in the client bundle as `EXPO_PUBLIC_*`.
- `data/users.json` is created at runtime and gitignored.
- This sample does not affect the published SDK (`files` only ships `dist` + README).
