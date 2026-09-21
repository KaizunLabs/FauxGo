# FauxGo

> All the journey. None of the going.

FauxGo is an open-source, cross-platform entertainment simulator for the familiar rituals of modern on-demand apps. Browse fictional food and groceries, plan imaginary rides and courier trips, choose extravagant made-up air transport, review a pretend total, and watch an accelerated journey unfold.

**Nothing in FauxGo is real.** It cannot place an order, book transport, charge a card, contact a person, access a live location, or send a request to a partner service. All people, businesses, places, menus, prices, vehicles, routes, ETAs, and events are fictional.

## Platforms

One Expo/React Native codebase targets iOS, iPadOS, Android phones and tablets, mobile web, tablet web, and desktop web. The web app is statically exportable. Native development uses Expo development builds or Expo Go during local iteration.

## Current experience

- Persistent simulation disclosure from onboarding through confirmation and tracking
- Food and grocery browse, item detail, basket, price review, and delivery simulation
- Everyday rides, premium transport, courier, and fictional sky journeys
- Original catalog, service, operator, vehicle, and place content
- Deterministic 60-second lifecycle with assignment, tracking, ETA, arrival, and completion states
- Local persistence for preferences, basket, and up to 30 simulation records
- Responsive mobile navigation and desktop sidebar
- Light and dark appearance, keyboard focus, reduced-motion support, and accessible labels
- No account, backend, analytics, ads, partner APIs, payment SDK, or sensitive permission request

## Development

Requirements: Node.js 22.13 or newer and npm.

```bash
npm ci
npm run web
```

Run the complete local gate with `npm run verify`. Individual commands are `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build:web`.

For native development, install the platform toolchain and run `npm run android` or `npm run ios`. iOS builds require macOS/Xcode. Store and signed-device builds require an Expo account and relevant Apple/Google developer credentials.

## Architecture

FauxGo intentionally has a small architecture: Expo Router screens, a typed local catalog, a React context persisted with AsyncStorage, and a deterministic timestamp-based simulation engine. There is no server. See [Architecture](docs/ARCHITECTURE.md) and [Product principles](docs/PRODUCT.md).

## Safety and privacy

The hard boundary is that no code path may create a real-world service request or financial transaction. See [Security](SECURITY.md) and [Privacy](PRIVACY.md). Proposed contributions that add real provider integrations, operator contact, live tracking, payment credentials, or imitation branding will not be accepted.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Licensed under [MIT](LICENSE), © 2026 Kaizun Labs and FauxGo contributors.

FauxGo is independent and unaffiliated with any real delivery, transport, grocery, restaurant, courier, or aviation service.
