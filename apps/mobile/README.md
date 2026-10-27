# @moneta/mobile

Expo (React Native) app of Moneta, Android first. See the repo [README](../../README.md) and
[docs/PLAN.md](../../docs/PLAN.md) (section "apps/mobile").

```sh
npm run mobile                 # from the repo root
npx expo install <package>     # from this folder: always use this to add dependencies
npx expo run:android           # development build (needed once native modules are added)
```

Set the API address in `.env.local`: `EXPO_PUBLIC_API_URL=http://<home-server-ip>:8080`.
