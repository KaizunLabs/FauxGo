# Dependency review

Dependencies are intentionally limited to Expo/React Native runtime packages, Expo Router, vector icons, local AsyncStorage, and haptics. Development dependencies provide linting, TypeScript, tests, and coverage.

At the September 13, 2026 baseline, `expo-doctor` passes all 21 checks. `npm audit` reports moderate transitive advisories in current Expo tooling/router dependencies and offers only incompatible downgrades rather than a safe patched SDK 57 resolution. There are no reported high or critical advisories. Maintainers should update within the stable Expo 57 line as fixes land, rerun `expo-doctor` and `npm audit`, and never use `npm audit fix --force` when it proposes an older incompatible Expo SDK.
