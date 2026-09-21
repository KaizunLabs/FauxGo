# Progress

Updated: 2026-09-20

## Targeted stabilization pass

The approved refoundation remains intact. The Search raw-text crash was reproduced and fixed, and a compiler-backed repository check now rejects equivalent string/number short-circuit children under View-like containers. The desktop rail now genuinely transitions between 176 and 76 px, the content column reclaims the released width, reduced motion is respected, icon-only items retain accessible names, and the persisted preference survives reload.

The local library now includes four original images and 149 curated Pexels imports with provenance, three optimized responsive variants, a deterministic semantic resolver, coverage reporting, and a development-only contact sheet. Current catalog coverage is 804 high-confidence, 2,016 family, 1,992 generic, and 612 neutral placeholders across 5,424 generated item instances. The remaining 21 unmapped titles intentionally avoid misleading substitutions. Deterministic cuisine-, dish-, and grocery-aware descriptions replace the universal boilerplate; the final review also corrected category-ordering errors such as ice cream inheriting personal-care copy.

Web and native MapLibre adapters preserve validated provider polylines, distance-normalized interpolation, and cached review-to-tracking geometry. Default road fallback is now a labelled dashed approximation with endpoint markers and no moving road vehicle. Air retains illustrative animation. No production routing/geocoding provider is configured or live-verified.

## Verification evidence

- `npm run verify` passes after the final Expo-compatible patch updates: formatting, the React Native JSX text-node audit, TypeScript, lint, 53 tests in ten files, and static web export.
- `npm run test:e2e` passes both browser tests. Primary and service routes render without the native text overlay; the desktop rail contracts, releases content width, navigates in collapsed mode, persists across reload, expands again, and introduces no horizontal overflow.
- Manual browser QA passed at desktop width: Home, Search, Activity, Settings, Eats, Market, and Ride opened without an Expo error overlay. The Eats flow reached local checkout and tracking; Market reached a correctly illustrated product detail; Ride reached review and tracking and recovered active progress after reload.
- With no road provider configured, both food and ride tracking visibly showed the dashed approximate connection, endpoint markers, no moving road vehicle, and the explicit offline-routing notice. Recenter and Overview remained operable. Configured-provider geometry, multiple-turn interpolation, malformed responses, timeout fallback, and Air behavior are covered by routing tests; live-provider verification remains external.
- The full photo contact sheet was reviewed during the pass and obvious false matches were corrected. The final generated report contains 153 runtime photos and 5,424 catalog item instances; the importer rerun was idempotent (`0 new, 149 already present`).
- iOS and Android Hermes exports pass. These prove bundling, not physical-device execution or signed release builds.
- `npx expo install --check` reports dependencies current and Expo Doctor passes all 21 checks.
- The runtime-photo payload is 459 WebP derivatives / 17.42 MiB. The latest web export is 23,518,022 bytes and the combined native export is 28,087,009 bytes; source masters are not runtime imports.
- Secret checks confirm `.env.local` is ignored and untracked, and no `PEXELS_API_KEY` or Pexels API endpoint reference exists in `src`, `dist`, or `dist-native`.
- `npm audit` reports 15 moderate transitive advisories and zero high or critical findings. Its proposed remediations require incompatible Expo, Expo Router, splash-screen, or MapLibre version changes, so no unsafe forced downgrade was applied.

## Remaining acceptance work

Remaining work outside this targeted pass includes:

- Native map/device QA and live configured routing/geocoding validation.
- Notification tap navigation and real-device permission, lifecycle and sound checks.
- Favorites discovery and remaining service-specific polish.
- Public landing/PWA and complete responsive screenshot matrix.
- Broader automated end-to-end coverage, accessibility, and release/security review.
- Documentation alignment, deployed-provider disclosures, privacy contact and store assets.

No milestone is considered complete solely from code or export success.

## External release requirements

- Apple Developer and Google Play enrollment, signing identities, store records and physical-device release testing.
- Production map/routing/geocoding endpoint selection and operational terms; credentials only where the selected provider requires them.
- AdMob/AdSense publisher and placement IDs plus production consent configuration, if monetization is enabled. Advertising is currently inactive.
- Optional Supabase credentials only if cloud sync is later approved; guest mode has no cloud dependency.
- A monitored privacy contact and hosting-specific disclosures before public deployment.
- Store review acceptance cannot be guaranteed; honest entertainment metadata and disclosures remain required.
