# @moneta/mobile

Expo (React Native) app of Moneta, Android first. See the repo [README](../../README.md) and
[docs/PLAN.md](../../docs/PLAN.md) (section "apps/mobile").

```sh
npm run mobile                 # from the repo root
npx expo install <package>     # from this folder: always use this to add dependencies
npx expo run:android           # development build (needed once native modules are added)
```

The server address is typed on the login screen (saved in secure storage); `EXPO_PUBLIC_API_URL` in `.env.local`
only sets the default. Plain HTTP to the home server is allowed (`expo-build-properties`, `usesCleartextTraffic`).

Screens: login, Accueil (month totals, advice, spending by category, end-of-month forecast), Opérations (search,
recategorize), Abonnements, Plus (import a bank file, budgets, sign out).
