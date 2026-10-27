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
  money.ts        parseAmountInput ("12,50" → cents), centsToInput
  format.ts       fr-FR formatting: money (cents), dates, months (formatMonth, addMonths, currentMonth), percent
  api/schema.ts   GENERATED from ../moneta-api/docs/openapi.yaml (npm run api:types -w @moneta/shared)
  api/types.ts    friendly aliases (Account, Transaction, ImportPreview…)
  api/client.ts   createApi(baseUrl, TokenStore, onSessionEnd): openapi-fetch client over a fetch that adds the
                  bearer token and refreshes once on 401; ApiError, unwrap, checkHealth
  api/session.ts  signIn / signOut (web: refresh cookie; mobile: refresh token in the TokenStore)
  api/context.tsx ApiProvider / useApi
  insights.ts     insightText (kind + params → French sentence), visibleInsights (no repeats across months)
  queries/        TanStack Query hooks per resource; keys.ts (+ transactionDerived invalidated after imports and
                  corrections)
apps/web/
  src/theme.ts    tokens → CSS variables (--color-*, --space-*, --radius-*), injected before render
  src/api.ts      web TokenStore (access token in memory) + api instance + onSessionEnd
  src/auth/       SessionProvider (refresh on load, signIn/signOut)
  src/App.tsx     loading / AuthPage / router; src/routes.tsx route table
  src/strings.ts  French UI strings, grouped by screen
  src/ui/         kit.tsx (Button, Field, Input, Select, Card, PageHeader, EmptyState, Spinner, ErrorText),
                  Modal.tsx (native dialog), Money.tsx (Money, CategoryBadge), CategorySelect.tsx, ui.module.css
  src/layout/     AppShell (sidebar ≥ 720 px, bottom bar below)
  src/features/   one folder per screen: auth, dashboard, transactions, import, accounts, categories
                  import/: ImportPage (step state) → UploadStep → MappingStep (roles.ts: column role ↔ Mapping)
                  → ReviewStep (near-duplicates skipped unless kept) → DoneStep; ImportHistory (undo)
                  transactions/: filters in the URL (?q=&account=&category=&uncategorized=true&from=&to=),
                  infinite list, inline CategorySelect → ApplyRuleDialog (this one / whole merchant),
                  source badge → ExplainDialog (rule, keyword or model words + confidence)
                  categories/: tree, RulesCard, ModelCard (activation progress, holdout accuracy, retrain)
                  recurring/: subscriptions / bills / income / inactive groups with monthly totals, price
                  changes, "subscription?" and "ignore" toggles
                  budgets/: progress bars (80 % warn, > 100 % alert), inline amount edit, add/remove
                  insights/: InsightsList (dashboard top 4, budgets page all), dismiss
                  dashboard/: MonthSwitcher, Kpis, CategoryDonut, MonthlyBars (12 months stacked), TopMerchants,
                  ForecastCard (current month: median line in the p25–p75 band, items still expected)
  Dockerfile      optional: built from the repo root, Caddy serves dist/ and proxies /api (used by moneta-api's
                  compose file and CI; the home server instead runs moneta.exe with MONETA_WEB_DIR=apps/web/dist)
.github/workflows/ci.yml  npm ci, check, web build, Expo Android export, web Docker image build
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
  themed via `useTheme()`, optional web Dockerfile + Caddyfile, CI. `npm run check`, web build, expo-doctor and an
  Android export bundle pass; the web build is served by `moneta.exe` (checked).
- ✅ W1: shared API client + hooks (types generated from the OpenAPI file), session, routing, UI kit, app shell,
  login/register.
- ✅ W2: accounts page (banks, accounts with anchor balance), categories page (tree, edit) with rules card.
- ✅ W3: import wizard (known formats skip the mapping step), history with undo.
- ✅ W4: transactions page (search, filters, load more, inline recategorization with merchant rule).
- ✅ W5: dashboard. **Web MVP complete**, checked in a headless browser (sign up → accounts → 3 imports incl.
  overlap review → transactions → dashboard, desktop and 390 px wide).
- ✅ W6: subscriptions page; transfers shown as "Virement interne" with an unpair button (pairing by hand is
  API-only, rarely needed). The import keeps the account picked in the form even when the format is known.
- ✅ W7: budgets page and insights (dashboard + budgets page); mobile bottom bar scrolls with 7 entries.
- ✅ W8: model status card, "why this category" dialog.
- ✅ W9: forecast card on the dashboard.
- Next: API M11 (export, delete account, hardening) + W10 (settings).
