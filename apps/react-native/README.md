# Fireblocks Sandbox Frontend (Expo Router)

## Quick start

1. Install dependencies:

```bash
pnpm -C apps/react-native install
```

2. Create env file:

```bash
cp apps/react-native/.env.example apps/react-native/.env
```

3. Ensure provider server is running on `http://localhost:4100`.

4. Start web preview:

```bash
pnpm -C apps/react-native dev:web
```

## Pages

- `/` Home
- `/assets` Asset list (`GET /fireblocks/assets`)
- `/vaults` Vault list (`GET /fireblocks/vaults`)
- `/transaction` Transaction query (`GET /fireblocks/transactions/:txId`)
