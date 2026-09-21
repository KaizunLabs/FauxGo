# Research notes

Architecture and release decisions were checked against primary documentation on September 13, 2026.

- [Expo SDK reference](https://docs.expo.dev/versions/latest/) lists SDK 57 as the current stable line, targeting React Native 0.86, React 19.2, Android API 36, and iOS 16.4+.
- [Expo data storage guidance](https://docs.expo.dev/develop/user-interface/store-data/) identifies AsyncStorage as appropriate for small, non-sensitive preferences and app state.
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) warn that an entertainment label alone does not overcome false-information or trick-functionality concerns. This is why FauxGo uses persistent, contextual disclosures and honest metadata instead of a one-time disclaimer.
- [Google Play deceptive behavior policy](https://support.google.com/googleplay/android-developer/answer/9888077) requires app metadata and behavior to accurately represent functionality and prohibits impersonation. FauxGo therefore uses original identity/content and never claims a real-world capability.

Store policies change. Recheck the current versions during every release candidate review.

## Refoundation research, September 14, 2026

- [OSRM route API](https://project-osrm.org/docs/v5.24.0/api/) provides GeoJSON line geometry, distance and duration from selected endpoint coordinates. [Photon API](https://github.com/komoot/photon/blob/master/docs/api-v1.md) supports explicit text search with bounded results. Both are configurable adapters; FauxGo does not treat a public demonstration endpoint as a production service.

- [OpenFreeMap quick start](https://openfreemap.org/quick_start/) and [public-instance terms](https://openfreemap.org/) support a no-key default basemap for web and native applications. Preserve its built-in OpenFreeMap, OpenMapTiles and OpenStreetMap attribution. This is map rendering only, not commerce or routing. Deployments can self-host or configure another style URL.
- [MapLibre Expo setup](https://maplibre.org/maplibre-react-native/docs/setup/expo/) requires a development/native build; Expo Go is not the native verification target. Installed MapLibre GL JS 6.9 ships separate ESM workers. The web build copies the exact installed worker/shared pair to the same origin and sets its URL before constructing maps.
- [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) provides shared image rendering and native memory/disk caching. FauxGo uses original generated WebP derivatives at thumbnail, card and hero sizes.
- [Expo foreground location](https://docs.expo.dev/versions/latest/sdk/location/) is requested only after a contextual user action. No background location, activity recognition or foreground location service is enabled.
- [Expo notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/) supports local notifications without a push token. The notification plan excludes past events and manual journey stages until the user starts, and caps queued events at 60.
- [Consumer ride flow reference](https://www.uber.com/us/en/ride/how-it-works/) informed destination-first sequencing and pickup review, not visual assets, branding or copied screens. FauxGo uses original service content, generated menus and synthetic people.
