# Architecture decisions

## ADR-001 — One Expo application

**Decision:** Keep one Expo SDK 57 / React Native 0.86 application with Expo Router and React Native Web.

**Why:** Current stable Expo supports Android API 36, iOS 16.4+, and the required web/native surfaces. Shared UI and domain code minimize drift while `.native` / `.web` modules isolate platform integrations.

## ADR-002 — Guest-first, local-first release

**Decision:** The release has no mandatory backend. Validated versioned local state is canonical. Supabase remains optional and unimplemented until cross-device value and credentials exist.

**Why:** Every core experience works offline and no real-world transaction exists. A backend would add privacy, security, uptime, and RLS obligations without improving the simulation's first release.

## ADR-003 — Timestamp-derived state machine

**Decision:** Store an immutable start timestamp, pace, deterministic stage schedule, and explicit manual gates. Derive snapshots at read time and reconcile missed notification milestones.

**Why:** Chained timers fail across suspension/reload. Derived state is testable and naturally recovers.

## ADR-004 — MapLibre with a provider boundary

**Decision:** Use MapLibre React Native 11.x in development builds and MapLibre GL JS 6.x on web through platform files. Production requires a configured style URL; development may use MapLibre demo tiles. A schematic/textual fallback and deterministic route generator remain available.

**Why:** The open rendering stack meets the product direction without making community OSM raster servers a production dependency. Native MapLibre cannot run in Expo Go, so development builds are required.

## ADR-005 — Local demo payment model, no real dispatch path (revised)

**Decision:** Checkout supports an allowlisted local payment-method selection: demo card, wallet, UPI in India, and cash where applicable. Persist method IDs only. There is no credential entry, payment SDK, telephone URL, partner ordering client, or dispatch endpoint.

**Why:** Safety is architectural, not merely copy. This makes accidental real transactions impossible within the repository.

## ADR-006 — Original seed content and restrained identity

**Decision:** Ship fictional multi-market content and one coral brand accent. Service distinctions use naming/iconography rather than a rainbow palette. SVG is the identity source of truth.

**Why:** This protects the trademark/copyright boundary and produces a credible consumer product rather than a parody clone.

## ADR-007 — Account and ads integrations are optional compile-time capabilities

**Decision:** Provider adapters default to disabled. Client-visible IDs may use `EXPO_PUBLIC_*`; secrets never may. Development ads use official demo units only, and automated tests never initialize ad SDKs.

**Why:** Local setup must remain credential-free, test traffic must never hit production ads, and optional integrations must not weaken guest mode.

## ADR-008 — Apple review risk is explicit

**Decision (revised by refoundation brief):** Keep clear disclosure in onboarding, final confirmation, receipt information, About/legal, and metadata. Remove repeated badges and synthetic terminology from ordinary discovery and tracking. Avoid prank, deception, or fabricated external actions.

**Why:** Apple App Review Guideline 1.1.6 says an entertainment label alone does not cure false/trick functionality. Transparent framing is both ethical and necessary, though approval remains an external decision.

## ADR-009 — Light-first consumer refoundation

**Decision:** Default appearance is Light; Dark and System are explicit persisted choices. Replace the fixed desktop sidebar with a persisted collapsible rail and a consumer header. Replace serif headings, service-card dashboard and emoji artwork with compact sans-serif hierarchy and photographic commerce discovery.

**Why:** The active user brief explicitly rejects the original composition. Working domain behavior is preserved; the visual design is intentionally superseded.

## ADR-010 — Generated catalog and curated photography

**Decision:** Generate stable merchants and substantial menus from typed cuisine/product seeds across IN/US/GB. Generate menus lazily, page search, and reuse a curated original photographic asset set with appropriate category mapping and responsive derivatives.

**Why:** Thousands of searchable entries can remain reproducible and small without scraping, duplicated giant JSON files, or thousands of images.

## ADR-011 — Contextual foreground location

**Decision:** A user-initiated explanation precedes foreground permission. Manual selection, saved places, recent locations and map selection remain available. Rendering, geocoding and routing are independent adapters. Precise coordinates stay local except when the user explicitly requests configured routing/search services; never send them to analytics or ads.

**Why:** The active brief permits geography while prohibiting real service requests. Remove the deployment header that blocks the permitted foreground capability.

## ADR-012 — Honest road-route fallback

**Decision:** Animate road vehicles only when a validated provider polyline is stored with the simulation. When routing is unavailable, retain timestamp progress and ETA, show endpoints and a subdued dashed approximate connection, and hide the geographic vehicle marker. Air may continue to animate direct illustrative geometry.

**Why:** A local curve is useful for quote continuity but is not evidence of a drivable street. Separating simulation progress from geographic position prevents the interface from depicting a car or courier crossing buildings.

## ADR-013 — Curated local stock photography

**Decision:** Keep Pexels access entirely in a build-time importer, preserve full per-asset provenance, optimize local derivatives, and resolve them with deterministic semantic tiers. A neutral placeholder outranks an unrelated photograph.

**Why:** A larger library only improves the product when its sources remain auditable, its bundle is controlled, and its mappings are honest and stable across renders.
