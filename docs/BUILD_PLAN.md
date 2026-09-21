# Build plan

Each milestone is complete only after implementation, automated checks, and relevant runtime inspection. Status is tracked in `PROGRESS.md`.

## Active refoundation acceptance overlay

The 2026-09-13 refoundation brief supersedes conflicting visual/copy decisions below. Required: Light default and persisted Light/Dark/System; new logo concepts inspected at five sizes; original photographic assets and responsive derivatives; thousands of deterministic searchable catalog entries; merchant/menu hierarchy; contextual foreground/manual/map/saved location; independent map/routing/geocoding adapters; collapsible persisted desktop navigation; region-aware local payment methods with no sensitive fields; natural transactional language with boundary disclosures; comprehensive settings; redesigned public website; screenshots at 390/430/768/1024/1366/1440/1920 px for all major screens. Tests must cover generation/search, location outcomes, theme/rail persistence, payment allowlisting, provider fallback and recovery.

## 0 — Research, architecture, product and repository

- Audit the existing universal Expo app and preserve useful foundations.
- Verify current Expo, Router, MapLibre, permissions, notifications, store, ads, and accessibility guidance.
- Establish project rules, architecture, decisions, release risks, environment contract, and milestones.

## 1 — Identity and design system

- Produce original SVG mark, horizontal/monochrome/OG variants, favicon, app icon, and adaptive foreground.
- Implement accessible coral/ink/paper tokens, typography, iconography, focus, and motion foundations.

## 2 — Universal shell and persistence

- Implement Home, Search, Activity, and Profile navigation for phone, tablet, and desktop.
- Version and validate guest state, settings, favorites, saved places, carts, and history.
- Add malformed-state recovery and export/delete controls.

## 3 — Simulation core

- Implement strongly typed services, regional pricing, deterministic timelines, pace profiles, routes, progress interpolation, heading, notification events, manual gates, and recovery.
- Unit-test pricing, stage boundaries, recovery, route math, formatting, regional configuration, persistence normalization, and ad rules.

## 4 — FauxGo Eats

- Ship fictional restaurant discovery, categories, filters, menus, dish options, cart, transparent checkout, full delivery timeline, receipt, and rating.

## 5 — FauxGo Market

- Ship stores, product categories, availability, quantities, substitutions, fees, checkout, picker/packing/courier stages, receipt, and rating.

## 6 — FauxGo Ride

- Ship manual/current pickup and destination, quote, Bike/Auto/Economy/Comfort/XL selection, assignment, arrival, explicit “start ride” gate, travel, receipt, and rating.

## 7 — Black, Air, and Send

- Ship complete premium chauffeur, explicitly fictional air, and package-courier flows with service-specific inputs, operators, vehicles, timelines, receipts, and ratings.

## 8 — Maps and routing

- Implement MapLibre Native and MapLibre GL JS through a platform adapter.
- Add configurable production style/routing providers, attribution, deterministic offline route fallback, smooth route-following markers, user-broken camera follow, and recenter.

## 9 — Lifecycle feedback

- Schedule coherent local notifications where supported, in-app fallbacks elsewhere, haptics/sound preferences, reduced motion, and timestamp reconciliation after sleep/reload.

## 10 — Discovery and personal surfaces

- Complete universal grouped search, activity detail, favorites, saved places, restrained stats, guest profile, locale/currency/pace/notification/privacy/ad settings, data export, and deletion.

## 11 — Optional cloud accounts

- Keep guest mode canonical. Add Supabase only when credentials and cross-device sync justify it; require migrations, RLS, server-owned user identity, deletion, and offline failure behavior.

## 12 — First-class web and PWA

- Add responsive product/marketing pages, how it works, open source, about, privacy, terms, SEO/social metadata, sitemap, manifest, installability, keyboard operation, and useful desktop panels.

## 13 — Responsible ads preparation

- Isolate native/web providers behind configuration, consent and privacy choices, official development test units, frequency caps, new-user protection, safe placements, and ads/app-ads guidance.

## 14 — Accessibility, privacy, security, performance and failures

- Audit WCAG 2.2 AA, font scaling, screen readers, touch targets, focus, reduced motion, permissions, privacy boundaries, secrets, dependency risk, offline/degraded states, and bundle/image weight.

## 15 — Test and defect loop

- Run unit/component/E2E, native bundle/build validation, responsive matrix, onboarding and every service end-to-end; repair discovered defects and repeat.

## 16 — Open-source and release readiness

- Finalize public documentation, notices, environment samples, CI, screenshots/store assets, release checklist, platform metadata, and honest external blockers.
