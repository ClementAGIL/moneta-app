# moneta-app

Web and mobile apps of **Moneta**, a self-hosted spending analyzer: import the CSV or Excel exports of all your bank
accounts and see, in one place, where your money goes: categories, subscriptions, budgets, end-of-month forecast
and advice to save more.

The backend is [moneta-api](../moneta-api) (Go + PostgreSQL).

> Status: web app complete (import wizard, transactions, dashboard, subscriptions, budgets and advice, forecast,
> settings); mobile app in progress. See [docs/PLAN.md](docs/PLAN.md) for the screens and roadmap.

## What's inside

| Path              | What                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `apps/web`        | React + TypeScript web app (Vite)                                    |
| `apps/mobile`     | React Native app (Expo, Android first)                               |
| `packages/shared` | Shared design tokens, API client, data hooks, formatting, validation |

Both apps use the same design tokens and the same API layer, so a color, a formatting rule or an endpoint change is
made once.

## Run

```sh
npm install
npm run web      # http://localhost:5173, /api is proxied to the API on :8080
npm run mobile   # Expo dev server; press "a" for the Android emulator
```

The mobile app reads the API address from `apps/mobile/.env.local`:

```sh
EXPO_PUBLIC_API_URL=http://192.168.1.10:8080
```

## Check

```sh
npm run check                  # type-check every workspace + Prettier
npm run build -w @moneta/web   # production web build
```

## Deploy (home server)

Build the web app (`npm run build -w @moneta/web`) and start the API with `MONETA_WEB_DIR` pointing at
`apps/web/dist`: the API serves the app on `/` and itself on `/api`, one process and one origin.

Optional: `apps/web/Dockerfile` (built from this repo's root) packages the web app in a Caddy image, used by the
`docker-compose.yml` in `moneta-api`.
