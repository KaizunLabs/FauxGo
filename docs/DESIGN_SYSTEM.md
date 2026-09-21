# Design system

## Character

FauxGo is a calm consumer mobility product with one quiet absurdity: nothing physically happens. The interface must look trustworthy without pretending the simulation is real. Humour lives in sparse copy, never in visual sloppiness.

## Identity

The previous ribbon mark is unapproved. Explore and render several simple geometric concepts at 16, 24, 32, 64 and 512 px before selecting a new identity. The selected mark must work in monochrome without resembling a pin, bag, car, lightning bolt or an F in a circle. The wordmark uses a compact neutral sans-serif.

Logo masters live in `assets/brand`. SVG is authoritative; generated PNGs exist only for platform launchers and stores. Clear space is one mark-width around the horizontal lockup. At 24 px and below, use the mark alone.

## Color

| Token     | Light     | Dark      | Purpose                         |
| --------- | --------- | --------- | ------------------------------- |
| Ink       | `#171716` | `#F7F4EE` | Primary text and controls       |
| Paper     | `#F7F4EE` | `#171716` | App canvas                      |
| Surface   | `#FFFDFC` | `#232321` | Raised/content surface          |
| Warm gray | `#E8E3DC` | `#383633` | Dividers and quiet fills        |
| Coral     | `#E2523E` | `#F07160` | Primary action and active state |
| Success   | `#2F7151` | `#72C69B` | Completed states                |
| Warning   | `#95651F` | `#E7BB6B` | Degraded or attention states    |
| Danger    | `#A13C34` | `#F08B81` | Destructive actions             |

Coral is the only branded accent. Service families use icons and language, not six unrelated colors. Text/background pairs must meet WCAG 2.2 AA contrast.

## Type and layout

Use system UI fonts: Inter/system-ui on web and the platform sans-serif on native. Use weight and spacing for hierarchy; avoid decorative display faces and oversized in-product headings. Base copy is 16 px with 1.45 line height. Controls target at least 44 by 44 points.

Spacing uses a 4-point base: 4, 8, 12, 16, 24, 32, 48. Corner radii are 10, 16, and 22; pills are reserved for tags, filters, and compact status. Borders are sparse and shadows quiet.

## Responsive behavior

- Under 900 px: four-tab bottom navigation, single-column flows, full-width map/detail stacks.
- 900 px and wider: a consumer header with brand, location and search, plus a collapsible rail (72 px collapsed / 176 px expanded). Persist rail preference. Use horizontal photographic merchant rows and useful map/detail panels.
- 1280 px and wider: use available width for content and maps without giant type or excessive empty space.
- Sheets and dialogs retain explicit labels, keyboard focus, escape/back behavior, and non-map textual alternatives.

## Motion

Motion explains assignment, stage changes, route progress, sheets, and completion. Prefer opacity and transforms. Respect system reduced motion and the in-app preference. Never animate simply to decorate a static surface.

## Language

Use natural transactional terms: “Order confirmed,” “Your courier,” “Delivered,” “Trip complete,” and normally formatted currency. No repeated simulation badges or “faux” suffixes. Beside the final action state: “No real payment, order, ride or delivery will be created.” Onboarding and About/legal explain the product fully.

## Appearance and imagery

Default to Light even when the OS is dark. Persist Light/Dark/System. Use original generated photography for food, merchants and groceries with neutral image-error placeholders. Utility icons and clean vehicle illustrations may remain SVG. No emoji product artwork. Generate thumbnail, card and hero derivatives from a curated image set.
