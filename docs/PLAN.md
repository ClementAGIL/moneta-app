# Moneta — app plan (web + mobile + shared)

## Context

Moneta is a multi-user spending analyzer: import the CSV/XLSX exports of every bank account, get one deduplicated,
categorized view of where the money goes, with subscriptions, budgets, forecast and advice. The product decisions,
data model, import pipeline and API are in **`../moneta-api/docs/PLAN.md`**; read it first. This plan covers the
clients.

Decisions taken with the user (2026-10-27):

- **Web: React + TypeScript (Vite). Mobile: React Native + Expo**, Android first. Both in this npm-workspaces
  monorepo so they share the design system and everything that is not UI (first planned as native Kotlin, changed the
  same day for this reason).
- UI components are **not** shared (DOM vs native views); **tokens, API client, types, data hooks, validation,
  formatting and insight texts are**.
- UI in **French** first; all strings live in one place per app so English can follow.
- MVP is web-only (import wizard, transactions, dashboard). Mobile starts once the MVP API (M6) exists.
- The home server serves the web app and the API on one origin: `moneta.exe` serves `apps/web/dist` itself
  (`MONETA_WEB_DIR`), no Docker. The Caddy image (`apps/web/Dockerfile`) stays as an optional, CI-built alternative.

Environment: Node 22.14, JDK 17, Android SDK. Expo SDK 58 (React Native 0.88, React 19.3.0).

```
apps/web/          Vite + React + TS: the full app (import wizard, tables, charts, settings)
apps/mobile/       Expo + Expo Router: dashboard, transactions, import from the share sheet, alerts
packages/shared/   platform-free TS: tokens, API client + generated types, query hooks, zod schemas, formatting
```

---

## packages/shared

Consumed as TypeScript source (no build step): Vite and Metro both compile it. Must never import DOM- or
React-Native-specific code. React and TanStack Query are peer dependencies (hooks only).

| Module          | Content                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens.ts` ✅  | light/dark palettes, spacing, radius, font sizes                                                                                                                                                       |
| `categories.ts` | visual per default category key: color (from a 12-hue categorical palette), icon name                                                                                                                  |
| `format.ts` ✅  | `formatMoney(cents)`, `formatDate(iso)`, month labels, relative dates                                                                                                                                  |
| `money.ts`      | parse user input ("12,50", "-3.2") → cents                                                                                                                                                             |
| `api/schema.ts` | **generated** by `openapi-typescript` from `../moneta-api/docs/openapi.yaml` (`npm run api:types`)                                                                                                     |
| `api/client.ts` | `openapi-fetch` client + middleware: bearer token, one refresh on 401 then retry, error mapping                                                                                                        |
| `api/tokens.ts` | `TokenStore` interface: web keeps the access token in memory (refresh = HttpOnly cookie); mobile keeps both in `expo-secure-store`                                                                     |
| `queries/*.ts`  | TanStack Query keys, hooks and mutations per resource (summary, transactions infinite list, categories, imports, budgets, recurring, insights) with invalidation rules after an import or a correction |
| `validation.ts` | zod schemas: register/login, account, budget, mapping                                                                                                                                                  |
| `insights.ts`   | insight `kind + params` → French sentence + severity color (one table, used by both apps)                                                                                                              |

Rule: when the web and the mobile app both need a piece of non-visual logic, it moves here.

---

## apps/web

**Stack:** Vite 8, React 19.3, TypeScript strict, React Router 7 (data routers), TanStack Query 5, TanStack Virtual
(long tables), react-hook-form + zod, Recharts (charts), Radix UI primitives (dialog, popover, select, dropdown,
tooltip) styled with **CSS Modules over the token CSS variables** (`src/theme.ts` injects `--color-*`, `--space-*`,
`--radius-*`). No Tailwind: the tokens are the design system.

**Layout:**

```
src/main.tsx, App.tsx, theme.ts, routes.tsx
src/ui/                 small kit: Button, Input, Select, Dialog, Card, Table, Tabs, Money, CategoryBadge,
                        EmptyState, Spinner, Toast (one file + CSS module each)
src/layout/             AppShell (sidebar on desktop, bottom bar < 720 px), MonthSwitcher
src/auth/               session context (TokenStore in memory), RequireAuth, login/register pages
src/features/<feature>/ pages + components per feature: onboarding, import, transactions, dashboard,
                        categories, rules, recurring, budgets, insights, forecast, settings
src/strings.ts          French UI strings
```

**Screens:**

- **Login / register**, then **onboarding**: create a bank and its accounts (name, kind, current balance and date).
- **Import wizard** (the core screen, 4 steps): ① drop a file + pick the account (pre-selected from the matched
  profile); ② **mapping**: the raw grid preview with a role selector on each column header (date, amount, debit,
  credit, label, ignore), detected header row / delimiter / date format / decimal separator shown and editable,
  live preview of the parsed rows and per-row errors; ③ **review** near-duplicates side by side (keep / skip, "skip
  all"); ④ summary (new, duplicates, period) and commit. A known profile skips step ②.
- **Transactions:** virtualized table (date, label, account, category, amount), filters (account, period, category,
  uncategorized, search), inline category picker; on change, a dialog "apply to all CARREFOUR?" (rule). Shows the
  categorization source and the model's "why".
- **Dashboard** (MVP end): month switcher, KPIs (spent, income, savings rate, vs. previous month), donut by category,
  12-month stacked bars, top merchants, "N uncategorized" call to action, latest insights.
- **Subscriptions & recurring:** list with next date, monthly/yearly total, price-change badges, ignore.
- **Budgets:** per-category monthly amounts with progress bars; **insights** feed with dismiss.
- **Forecast:** balance line to end of month with the p25–p75 band, per account and total.
- **Settings:** banks/accounts, import profiles, categories & rules, model status (samples, accuracy rules vs. model),
  export my data, delete account.

Responsive down to phone width (the web app is also usable on mobile). Light/dark from the system.

---

## apps/mobile

**Stack:** Expo SDK 58, Expo Router (file routes in `src/app/`, screen bodies in `src/screens/`), TanStack Query,
`expo-secure-store` (tokens, server URL), `@expo/ui` native controls first (pickers, switches, bottom sheets),
FlashList for transactions, a Skia-based chart lib (choose at A2: `victory-native` or `react-native-gifted-charts`),
`expo-notifications` + `expo-background-task` for alerts, `expo-document-picker` for in-app import.
Follow `apps/mobile/AGENTS.md` (Expo rules: `npx expo install`, versioned docs for SDK 58, no hand-edited `android/`).

**Server URL:** the API is on the home server. Default from `EXPO_PUBLIC_API_URL`; editable on the login screen,
saved in secure store. The LAN uses plain HTTP, so release builds need `expo-build-properties`
(`android.usesCleartextTraffic: true`) until the server gets HTTPS.

**Screens (tabs: Accueil, Opérations, Abonnements, Plus):**

- **Login / register** (+ server URL).
- **Accueil:** month KPIs, category donut, budgets at risk, latest insights.
- **Opérations:** infinite list grouped by day, filters, search; tap → detail sheet to recategorize (same "apply to
  merchant" question as the web).
- **Import from the share sheet:** in the bank's app, export the CSV/XLSX and share it to Moneta (Android
  `SEND` intent for csv / xlsx / octet-stream MIME types, via a config plugin such as `expo-share-intent`; check SDK
  58 support at A3, fallback = in-app document picker). Flow: upload → account (pre-selected by profile) → review
  near-duplicates → commit. Unknown format → "finish the mapping on the web once", since the mapping grid needs a big
  screen.
- **Abonnements:** recurring list, monthly total, price changes.
- **Plus:** budgets, forecast, insights, settings (server, logout, delete account link).
- **Notifications:** a background task fetches unread insights (budget exceeded, price increase, forecast below 0)
  and shows local notifications.

Builds: development build with `npx expo run:android` (needs the Android SDK, already installed), APK for the phone
with EAS (`eas build -p android --profile preview`) or a local Gradle release build.

---

## Milestones (one or more commits each; CLAUDE.md + README updated each time)

| #   | Web                                                                     | Needs API |
| --- | ----------------------------------------------------------------------- | --------- |
| W0  | ✅ Monorepo, Vite app, shared tokens → CSS variables, API health        | M0        |
| W1  | ✅ UI kit, routing, app shell, generated API types + client, auth pages | M2        |
| W2  | ✅ Onboarding (banks, accounts), categories list                        | M3        |
| W3  | ✅ Import wizard (upload, mapping grid, review, commit, history/undo)   | M4        |
| W4  | ✅ Transactions table, filters, search, recategorize + rule dialog         | M5        |
| W5  | Dashboard → **MVP complete**                                            | M6        |
| W6  | Subscriptions / recurring, transfer pairing UI                          | M7        |
| W7  | Budgets, insights feed                                                  | M8        |
| W8  | Model status, "why this category"                                       | M9        |
| W9  | Forecast chart                                                          | M10       |
| W10 | Settings: profiles, rules, export, delete account                       | M11       |

| #   | Mobile                                                        | Needs API |
| --- | ------------------------------------------------------------- | --------- |
| A0  | ✅ Expo app, shared tokens theme, API health                  | M0        |
| A1  | Server URL, login/register, secure tokens, tabs               | M2        |
| A2  | Accueil + Opérations + recategorize                           | M6        |
| A3  | Import from the share sheet / document picker, review, commit | M4        |
| A4  | Abonnements, budgets                                          | M7, M8    |
| A5  | Insights + background notifications                           | M8        |
| A6  | Forecast, release APK                                         | M10       |

## Verification

No unit tests by default (user's rule). `npm run check` (type-check all workspaces + Prettier) and
`npm run build -w @moneta/web` must pass; `npx expo-doctor` and `npx expo export --platform android` for the mobile
app. Then use it: web on desktop and phone width, mobile on the Android phone, against the real API and real bank
files.
