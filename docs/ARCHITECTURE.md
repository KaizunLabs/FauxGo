# Architecture

FauxGo is a single Expo SDK 57 application using React Native 0.86, React 19, TypeScript, and Expo Router. The same screens and domain logic run on iOS, Android, and web.

```text
src/app routes
    ↓
shared components + typed fictional catalog
    ↓
AppStore React context
    ↓
AsyncStorage on the current device

timestamp + service kind → deterministic simulation stage
```

The guest app requires no backend. Optional network adapters are limited to maps, geocoding and routing, and separately configured advertising. Commerce, dispatch and payment providers are prohibited. The local payment-method domain stores only allowlisted demo method IDs.

## Important areas

- `src/app`: file-based routes and full product flows.
- `src/components`: cross-platform primitives, photographic content and responsive consumer layouts.
- `src/core`: region profiles, deterministic generated catalog, pricing, timelines, route interpolation, preferences and validation.
- `src/platform`: native/web location, map and other capability adapters with graceful fallbacks.
- `src/data`: curated seeds and structured photographic asset manifest.
- `src/store/app-store.tsx`: hydration, persistence, basket, preferences, and history.
- `src/core/timeline.ts`: pure lifecycle derivation from creation time, pace, and manual-start gates. Earlier `src/lib` logic is retained only for legacy regression coverage.
- `src/constants/theme.ts`: shared visual tokens and responsive constants.

## State and safety

AsyncStorage holds local state under a versioned key, including user-selected addresses and coordinates that can be sensitive. It is not encrypted storage. Current progress is derived rather than updated in storage, so a flow resumes after refresh or process restart. History is bounded to 100 records. Storage failures show a warning and degrade to an in-memory session; malformed saved data is not silently overwritten.

The review action creates a local simulation and navigates to tracking. It never calls commerce/dispatch/payment services. MapLibre renders geography; independent configured routing/geocoding adapters may resolve user-selected points. Foreground location is requested only after “Use my location.” Background location is never requested. Local notifications may reflect timestamp-derived stages. Camera gestures break follow mode until the user recenters.

The refoundation is being migrated incrementally from the original route/store types. Preserve the existing tested timestamp behavior while converging on `src/core` as the domain source of truth. Generate menus on demand and paginate search; do not retain thousands of duplicated menu objects in app state. Photography uses a centralized generated manifest, local optimized derivatives, machine-readable provenance, and a deterministic semantic resolver. See `ASSETS.md` for the build-time Pexels pipeline and current coverage.

## Optional geography providers

`src/platform/geography.ts` supports configured HTTPS OSRM-compatible routing and Photon-compatible address search. There are no credentials embedded in source and no assumption that public demonstration servers are production backends. Routing sends only selected endpoints; address search sends only explicitly submitted text, without saved/device location bias. Responses are projected into bounded, validated core types. Requests have an eight-second timeout and cancellation; road-route failures retain the local illustrative route. Air transport always uses an illustrative path.

`useRoute` shares a bounded in-memory route cache between selection and checkout so a selected road estimate is retained through review and stored with the simulation. Maps, routing and geocoding are separate capabilities. A functional map does not imply road routing is configured. When a provider returns valid geometry, road markers interpolate by distance along that street-following polyline. In the default configuration, the basemap renders via OpenFreeMap while routing remains local; road fallback is a dashed, labelled approximation with endpoints and no moving vehicle marker. Air remains allowed to animate its illustrative path. Production street-following verification requires a configured service and native-device testing.
