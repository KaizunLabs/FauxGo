# Asset provenance

FauxGo ships a local, curated image library. It does not hotlink catalog photography at runtime, scrape restaurant menus, or claim that an illustrative image depicts a real partner business.

## Sources and credits

The library contains four original generated FauxGo images and 149 photographs imported through the official Pexels Photos Search API. Every image is recorded in `assets/photography/provenance.json` with its FauxGo asset ID, source class, Pexels photo ID, photographer and profile link, Pexels page, original image URL, import date, semantic tags, usage, orientation, and accessible description. The in-app Licenses & attribution page explains the mixed source library. Pexels creator and source links are retained in the development review sheet rather than repeated beneath every consumer card.

The original generated masters remain in `assets/photography`:

| Master               | Generation direction                                                                                                        | Current role             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `indian-master.png`  | Editorial food photography, paneer makhani with naan and rice on pale stone, 45-degree view, natural light, no logo or text | Indian food fallback     |
| `pizza-master.png`   | Editorial margherita pizza with tomato, basil and mozzarella, natural light, no logo or text                                | Pizza family             |
| `noodles-master.png` | Editorial miso mushroom noodles with egg and greens, natural light, no logo or text                                         | Noodle family            |
| `produce-master.png` | Fresh seasonal produce basket, natural light, no branded packaging or text                                                  | Generic produce fallback |

## Build-time import

`scripts/pexels-targets.mjs` defines 149 deterministic food, grocery, and merchant targets. `scripts/fetch-pexels-assets.mjs` reads `PEXELS_API_KEY` from the process or ignored `.env.local`, sends it only in the HTTPS Authorization header, validates returned URLs and content, filters unsuitable metadata, avoids duplicate Pexels IDs, and writes stable masters under `assets/photography/source`. Requests are sequential, bounded, timed out, retried only for transient errors, and resumable from provenance. The key is never part of runtime source or generated metadata.

Run `npm run photos:fetch` to resume an import. Pass one or more target IDs after `--` to deliberately replace selected candidates. Do not commit `.env.local`.

## Runtime optimization and mapping

`scripts/optimize-photography.mjs` crops each source with Sharp and creates WebP thumbnails (240×160), cards (640×427), and heroes (1280×853). It generates centralized static manifests in `src/data`; screens never scatter `require()` calls. The 149 stock masters occupy about 34.5 MiB as build sources. The 459 runtime derivatives for all 153 images occupy about 17.4 MiB; source masters are not referenced by the client bundle.

`src/core/photo-resolver.ts` deterministically ranks exact title/product semantics, close family matches, category-generic images, and finally a neutral designed placeholder. Cuisine compatibility prevents cross-cuisine matches, and broad words such as “grocery,” “frozen,” or “curry” cannot alone force a misleading exact photo.

## Review and coverage

Run `npm run photos:report` after catalog or mapping changes. It writes:

- `docs/assets/photo-coverage.json`, with generated counts by confidence level.
- `docs/assets/photo-review.html`, a development-only contact sheet with every thumbnail, semantic tags, source/photographer links, and mapped catalog examples.

The current generated catalog report covers 5,424 item instances across 330 unique titles: 804 high-confidence, 2,016 family, 1,992 category-generic, and 612 neutral placeholders. The 21 unmapped titles remain neutral by design until a genuinely suitable image exists. This intentionally favors an honest neutral state over false product details such as still water shown as sparkling water, pepperoni represented by a vegetable pizza, or household products represented by unrelated cleaning scenes.
