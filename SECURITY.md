# Security policy

Security fixes target the current `main` branch and latest published release.

Do not open a public issue containing secrets, personal data, or a working exploit. Send security reports privately to kaizunlabs.ofc@gmail.com.

FauxGo has no account, application server, payment, external operator contact, or real-service integration. Optional foreground device location is used only after the user requests it. Saved places, coordinates, and notes can be sensitive even though simulations are fictional; they remain in local application storage unless the user exports them. Dependencies are locked and CI uses least-privilege read permissions.

Reports are especially important if a change can transmit data, open a real service, collect credentials, expose local state across origins, inject content, escape the static web app, or confuse a pretend total with a real charge.
