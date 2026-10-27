# CLAUDE.md

Guidance for Claude (and any contributor) working in this repository. `AGENTS.md` points here.

## What this project is

Clients of **Moneta**, a multi-user spending analyzer (import every bank's CSV/XLSX, see where the money goes). The
backend is the Go API in `../moneta-api`, whose `docs/PLAN.md` holds the product decisions and data model. This
repo's plan is `docs/PLAN.md`; read both before changing behavior.

## Stack

npm workspaces monorepo:

| Workspace         | Stack                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `apps/web`        | Vite 8, React 19.3, TypeScript strict (TS 7)                                               |
| `apps/mobile`     | Expo SDK 58, Expo Router, React Native 0.88, React 19.3 — **read `apps/mobile/AGENTS.md`** |
| `packages/shared` | platform-free TypeScript, consumed as source by both apps (no build step)                  |

No unit tests by default (user's rule).

## Commands

| Command                                    | What it does                                     |
| ------------------------------------------ | ------------------------------------------------ |
| `npm install`                              | Install every workspace (from the repo root)     |
| `npm run web`                              | Web dev server (proxies `/api` to `:8080`)       |
| `npm run mobile`                           | Expo dev server                                  |
| `npm run check`                            | Type-check all workspaces + Prettier check       |
| `npm run format`                           | Prettier on the whole repo                       |
| `npm run build -w @moneta/web`             | Production web build                             |
| `cd apps/mobile && npx expo install <pkg>` | Add a mobile dependency (SDK-compatible version) |
| `cd apps/mobile && npx expo-doctor`        | Check the Expo setup                             |

## Architecture

```
packages/shared/src/
  tokens.ts       design tokens (palettes light/dark, spacing, radius, font sizes)
  format.ts       formatMoney(cents), formatDate(iso), fr-FR
  api.ts          checkHealth (becomes api/ with the generated client at W1)
apps/web/
  src/theme.ts    tokens → CSS variables (--color-*, --space-*, --radius-*), injected before render
  src/App.tsx     placeholder home (API status)
  Dockerfile      built from the repo root; Caddy serves dist/ and proxies /api to the api container
apps/mobile/
  src/app/        Expo Router routes only (_layout: themed stack; index: placeholder home)
  src/theme.ts    useTheme(): shared tokens for the current color scheme
  src/config.ts   API_URL from EXPO_PUBLIC_API_URL
```

## Conventions

- **Share everything that is not UI.** If web and mobile both need a piece of logic (API calls, query hooks,
  validation, formatting, insight texts), it lives in `packages/shared`. `shared` never imports DOM or React Native.
- **Tokens are the design system:** no hard-coded colors, spacing or font sizes in the apps. Web uses the CSS
  variables, mobile uses `useTheme()`. New token → `tokens.ts`, both apps pick it up.
- **One React version:** web and mobile pin the exact React version that Expo requires (now 19.3.0); otherwise
  `shared` would load two copies. Upgrade them together (`expo-upgrade` skill for the SDK).
- API types are generated from `../moneta-api/docs/openapi.yaml`; never hand-write response types.
- Money is integer cents from the API; format only at display time with `formatMoney`.
- UI strings in French, kept in one strings file per app.
- Short files (< ~300 lines), short functions/components (< ~40 lines), one job each. No duplicated logic.
- Constants in `UPPER_SNAKE_CASE` at the top of the file. Comments explain why. No `any`.
- Every file starts with a one-line comment saying what it is for.
- Every commit updates this file and the README when behavior or structure changes.

## Status

- ✅ W0 / A0 scaffold: monorepo, shared tokens/format/health, web placeholder themed via CSS variables, Expo app
  themed via `useTheme()`, web Dockerfile + Caddyfile. `npm run check`, web build, expo-doctor and an Android
  export bundle pass.
- Next: W1 (UI kit, routing, generated API client, auth pages) once the API has M2.
