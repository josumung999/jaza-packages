# Jaza open-source SDK packages

This Turborepo hosts publishable Jaza client libraries (starting with `@jazadev/node`).
`jaza-api` remains private; these packages call its public HTTP surface.

**npm org:** [`jazadev`](https://www.npmjs.com/org/jazadev)  
**GitHub:** [josumung999/jaza-packages](https://github.com/josumung999/jaza-packages)

## Packages

| Package | Path | Description |
|---------|------|-------------|
| `@jazadev/node` | [`@jaza-node`](./@jaza-node) | Node.js backend SDK |
| `@jazadev/react` | [`@jaza-react`](./@jaza-react) | React web SDK (Next.js, Remix, Vite) |
| `@jazadev/react-native` | [`@jaza-react-native`](./@jaza-react-native) | Expo / React Native top-up UI SDK |
| `@jazadev/react-example` | [`@jaza-react/example`](./@jaza-react/example) | Private Vite sample (not published) |
| `@jazadev/react-native-example` | [`@jaza-react-native/example`](./@jaza-react-native/example) | Private Expo sample (not published) |

## Scripts

```bash
npm install
npm run build
npm test
```

## Publish a package

Each workspace publishes independently (root is `private`):

```bash
npm login
npm run build
npm publish -w @jazadev/node
```
