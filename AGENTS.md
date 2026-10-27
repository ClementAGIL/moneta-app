# AGENTS.md

Instructions for AI coding agents. The source of truth is [CLAUDE.md](CLAUDE.md) (stack, architecture,
conventions, commands); the plan is [docs/PLAN.md](docs/PLAN.md). Expo-specific rules for the mobile app are in
[apps/mobile/AGENTS.md](apps/mobile/AGENTS.md).

Checklist before each commit:

1. Review the diff: no duplicated logic (shared logic goes in `packages/shared`), files < ~300 lines,
   functions < ~40 lines, no hard-coded colors or spacing.
2. `npm run format` and `npm run check` pass; `npm run build -w @moneta/web` for web changes.
3. Update `CLAUDE.md` (architecture/status) and `README.md` (usage) to match the change.
4. Small commits, one feature each.
