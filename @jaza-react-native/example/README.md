# Jaza React Native sample app

Private Expo demo for [`@jazadev/react-native`](../). **Not published to npm.** Demo-grade auth only (no OTP / passwords).

## What it shows

1. Sign in with email + phone → stored in `data/users.json`
2. First sign-in creates a Jaza customer via `@jazadev/node` and saves `customerId`
3. Home screen: `JazaBalanceWidget` + `JazaTopUpButton` (opens the SDK bottom sheet)

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

## Run (Expo Go)

```bash
# optional: rebuild SDK on change
npm run dev -w @jazadev/react-native

# from this directory
npm start
```

Scan the QR code with Expo Go. On a physical device, API routes are reached via the Metro host derived from `expo-constants` — phone and computer must be on the same network.

## Notes

- Secret key stays in Expo Router API routes (`app/api/**`); never in the client bundle as `EXPO_PUBLIC_*`.
- `data/users.json` is created at runtime and gitignored.
- This sample does not affect the published SDK (`files` only ships `dist` + README).
