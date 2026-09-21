# FauxGo contributor guide

FauxGo is an entertainment simulation. No implementation may place or imply a real order, booking, dispatch, payment, phone call, message, delivery, ride, or transport request.

## Working rules

- Keep domain rules in `src/core`; UI routes consume typed core APIs.
- Keep platform integrations behind `.native` / `.web` adapters with a local fallback.
- Treat all catalog entities, people, routes, prices, and businesses as fictional.
- Never add competitor names, marks, copied screens, scraped menus, real driver data, payment fields, background location, or partner booking APIs.
- Never put secrets in `EXPO_PUBLIC_*`. Those values are visible in client bundles.
- Guest mode and offline simulation must remain complete when every optional credential is absent.
- Add or update tests when changing pricing, timing, routing, persistence, permissions, or advertising rules.
- Preserve the coral/ink/paper design system in `docs/DESIGN_SYSTEM.md` and `src/constants/theme.ts`.
- Use `npx expo install` for Expo/native dependencies and verify with `npx expo install --check` and `npx expo-doctor@latest`.

## Before reporting completion

Run `npm run verify`. For release-oriented changes also run `npm run export:native`, `npm run test:e2e`, and the responsive browser checklist in `docs/RELEASE.md` when the environment supports them. Record genuine platform, credential, or signing blockers in `docs/PROGRESS.md`.
