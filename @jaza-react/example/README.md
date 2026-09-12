# @jazadev/react example (Next.js)

Self-contained demo mirroring the Expo sample: local BFF Route Handlers + `@jazadev/react` UI. No external host backend required.

## Setup

```bash
# from packages/
npm install
npm run build --workspace=@jazadev/react
npm run build --workspace=@jazadev/node

cd @jaza-react/example
cp .env.example .env.local
# fill JAZA_SECRET_KEY + NEXT_PUBLIC_JAZA_PUBLISHABLE_KEY
npm run dev
```

Open [http://localhost:5174](http://localhost:5174).

## Flow

1. **Sign in** → `POST /api/auth/sign-in` creates/remints a Jaza customer, stores user in `data/users.json`
2. **Home** → `JazaProvider` calls `POST /api/jaza/init` (`jaza.init`)
3. **Top up** → SDK drawer (bottom mobile / right desktop)
4. **Actions** → `POST /api/jaza/actions` (`jaza.consume` on the server)

## Routes

| Route | Role |
|-------|------|
| `POST /api/auth/sign-in` | Create / remint customer |
| `POST /api/jaza/init` | Client session handshake |
| `POST /api/jaza/actions` | Feature consume |
| `GET /api/jaza/balance` | Wallet balance |
