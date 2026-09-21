# Release readiness

## Automated gate

Run `npm run verify`. It performs strict TypeScript checking, ESLint, domain tests, and a static web export. Pull requests run the same gate in GitHub Actions.

## Web

The repository includes a Netlify static-export configuration and conservative security headers. Before publishing, run the gate in a clean checkout; deploy `dist`; test onboarding, commerce, mobility, history, reset, appearance, keyboard use, and 390/768/1440 px layouts; and add the final public privacy contact and canonical URL.

## Android and iOS

`eas.json` contains development, internal preview, and production profiles. Before store submission:

1. Create or select an Expo project and add its generated project ID.
2. Confirm the `com.kaizunlabs.fauxgo` identifiers are owned and final.
3. Provide Apple Developer and Google Play credentials through EAS; never commit them.
4. Produce signed preview builds and test process restart during tracking, screen readers, large text, reduced motion, light/dark appearance, and tablet rotation.
5. Supply original screenshots that continuously show the simulation disclosure.
6. Complete current store privacy, content-rating, encryption, and data-safety forms truthfully.

## Store policy risk

Apple scrutinizes false-information and trick/joke functionality even when an app says it is for entertainment. FauxGo mitigates—not eliminates—this risk through original branding, upfront acknowledgement, persistent disclosures, honest metadata, no impersonation, and no real-world side effects. Final acceptance is an external store-review decision.

This repository cannot create developer enrollment, signing certificates, store records, an Expo project identity, public support/privacy email, hosted domain, or final legal approval. Those require maintainer resources outside the repository.
