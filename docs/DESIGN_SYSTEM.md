# Design system

## Character

FauxGo is a calm consumer mobility product with one quiet absurdity: nothing physically happens. The interface must look trustworthy without pretending the simulation is real. Humour lives in sparse copy, never in visual sloppiness.

## Identity

The parallel passage mark consists of two rounded turns around an open center: the suggestion of a journey that never quite connects. Use a single coral fill, or one ink/paper fill in monochrome. The custom outlined wordmark spells **FauxGo**, with consistent geometry across platforms and no font dependency. Three geometric concepts were compared at small sizes before selecting this identity.

The authoritative masters are `assets/brand/fauxgo-mark.svg` and `fauxgo-wordmark.svg`. Run `npm run brand:generate` after editing them: all lockups, shared UI paths, launcher/splash images, favicon, Apple touch icon and share artwork derive from those two masters. Use `Brand` and `BrandHomeLink` in the app; do not crop the app icon into a header logo. The wordmark uses the active theme's ink and the mark uses its coral. Keep at least half a mark-width of clear space around standalone lockups. At 24 px and below, and in narrow header slots, use the mark alone with its full accessible name.

Use **Made by Kaizun Labs** in onboarding, the home footer, Settings and About. Logo home links are named **FauxGo home**; the information destination is **About FauxGo**. Keep studio credits quiet and separate from checkout actions.

## Color

| Token     | Light     | Dark      | Purpose                         |
| --------- | --------- | --------- | ------------------------------- |
| Ink       | `#20201F` | `#F5F2ED` | Primary text and controls       |
| Paper     | `#FCFBF8` | `#171716` | App canvas                      |
| Surface   | `#FFFFFF` | `#222220` | Raised/content surface          |
| Warm gray | `#E6E2DD` | `#403D38` | Dividers and quiet fills        |
| Coral     | `#C94332` | `#F58B79` | Primary action and active state |
| Success   | `#2F7151` | `#72C69B` | Completed states                |
| Warning   | `#A55C14` | `#F1AE67` | Degraded or attention states    |
| Danger    | `#A33C36` | `#EF9189` | Destructive actions             |

Coral is the only branded accent. Service families use icons and language, not six unrelated colors. Text/background pairs must meet WCAG 2.2 AA contrast.

## Type and layout

Use system UI fonts: Inter/system-ui on web and the platform sans-serif on native. Use weight and spacing for hierarchy; avoid decorative display faces and oversized in-product headings. Base copy is 16 px with 1.45 line height. Controls target at least 44 by 44 points.

Spacing uses a 4-point base: 4, 8, 12, 16, 24, 32, 48. Corner radii are 10, 16, and 22; pills are reserved for tags, filters, and compact status. Borders are sparse and shadows quiet.

## Responsive behavior

- Under 1024 px: four-tab bottom navigation with visible labels, single-column flows, full-width map/detail stacks.
- 1024 px and wider: a consumer header with brand, location and search, plus a collapsible rail (90 px collapsed / 196 px expanded). Keep Home, Search, Activity, and Settings labelled in both states; persist rail preference. Use multi-column merchant cards and useful map/detail panels.
- 1280 px and wider: use available width for content and maps without giant type or excessive empty space.
- Sheets and dialogs retain explicit labels, keyboard focus, escape/back behavior, and non-map textual alternatives.

## Motion

Motion explains assignment, stage changes, route progress, sheets, and completion. The vehicle follows a separate pickup leg before the journey leg and rests at pickup until a ride is manually started. Road-aligned geometry requires a configured routing provider; otherwise the route and moving marker are explicitly labelled illustrative. Respect system reduced motion and the in-app preference. Never animate simply to decorate a static surface.

## Language

Use natural transactional terms: “Order confirmed,” “Your courier,” “Delivered,” “Trip complete,” and normally formatted currency. No repeated simulation badges or “faux” suffixes. Beside the final action state: “No real payment, order, ride or delivery will be created.” Onboarding and About/legal explain the product fully.

## Appearance and imagery

Default to Light even when the OS is dark. Persist Light/Dark/System. Use curated photography only when it depicts the product or a close family; do not repeat an image within a menu or regional merchant list. Missing imagery becomes a text-first item row or an editorial merchant card, not a repeated stock photo or a broken-image icon. Utility icons and clean vehicle illustrations may remain SVG. No emoji product artwork. Generate thumbnail, card and hero derivatives from a curated image set.
