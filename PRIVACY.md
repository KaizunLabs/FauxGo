# FauxGo privacy policy

Updated October 8, 2026.

FauxGo runs without an account. It does not request real payment details, contacts, advertising identifiers, analytics, camera/microphone data, or photo-library content. Optional foreground location is requested only after the user chooses it. There is no background location tracking. Manual places and offline simulations remain available without permission.

The app stores onboarding choices, preferences, baskets and notes, favorites, ratings, saved/recent places and coordinates, and simulation history in local application storage without app-level encryption. Exports include these fields and should be shared carefully. Avoid sensitive information in notes. Delete data from Settings; device backups may retain copies even after uninstalling.

There are no real booking, payment, dispatch, advertising or analytics integrations. Online maps use OpenFreeMap by default: tile/style requests disclose the IP address and viewed map area to that provider. A deployment can configure a different map style provider. Optional OSRM-compatible routing sends selected trip endpoints and, for the simulated approach to pickup, a computed fictional operator start point and the selected pickup coordinate to the configured routing provider. Optional Photon-compatible address search sends the entered query only on explicit search; it does not include location bias. No routing or geocoding request occurs when these providers are absent. Provider URLs are public deployment configuration, not secrets. Requests can be processed or logged by those providers; maintainers must identify deployed providers and their policies before release.

Native notifications require opt-in and are scheduled on-device without registering push tokens. Journey details may appear on the lock screen. Users can disable notifications and sound in Settings, subject to OS settings. Web uses Activity instead of browser push.

The web version is hosted by Vercel. Vercel processes ordinary request information, including IP addresses and technical logs, to deliver the site. Vercel's [Privacy Notice](https://vercel.com/legal/privacy-notice) explains its handling of that information. FauxGo does not add analytics or advertising to the web version.

For privacy questions, contact Kaizun Labs at kaizunlabs.ofc@gmail.com. Repository issues must not contain personal or sensitive information.
