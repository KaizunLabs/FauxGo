import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMenu, getMerchants } from "../src/core/catalog";
import { resolvePhoto } from "../src/core/photo-resolver";
import type { PhotoConfidence, PhotoUsage } from "../src/core/photo-resolver";
import type { RegionCode } from "../src/core/models";

async function main() {
  const root = process.cwd();
  const outputDirectory = path.join(root, "docs/assets");
  const provenance = JSON.parse(
    await readFile(
      path.join(root, "assets/photography/provenance.json"),
      "utf8",
    ),
  );
  const regions: RegionCode[] = ["IN", "US", "GB"];
  const counts: Record<PhotoConfidence, number> = {
    high: 0,
    family: 0,
    generic: 0,
    placeholder: 0,
  };
  const mapped = new Map<string, Set<string>>();
  const placeholderTitles = new Set<string>();
  const uniqueTitles = new Set<string>();
  let catalogItems = 0;

  for (const region of regions) {
    for (const merchant of getMerchants(region)) {
      const merchantResolution = resolvePhoto(
        merchant.imageTags,
        merchant.id,
        "merchant",
      );
      if (merchantResolution.id)
        (
          mapped.get(merchantResolution.id) ??
          mapped
            .set(merchantResolution.id, new Set())
            .get(merchantResolution.id)!
        ).add(`Merchant: ${merchant.category}`);
      for (const item of getMenu(merchant.id)) {
        catalogItems += 1;
        uniqueTitles.add(item.title);
        const usage: PhotoUsage =
          item.serviceType === "market" ? "grocery" : "food";
        const resolution = resolvePhoto(item.imageTags, item.id, usage);
        counts[resolution.confidence] += 1;
        if (resolution.confidence === "placeholder")
          placeholderTitles.add(item.title);
        if (resolution.id)
          (
            mapped.get(resolution.id) ??
            mapped.set(resolution.id, new Set()).get(resolution.id)!
          ).add(`${item.category}: ${item.title.split("·")[0].trim()}`);
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    catalogItems,
    uniqueCatalogTitles: uniqueTitles.size,
    highConfidence: counts.high,
    family: counts.family,
    generic: counts.generic,
    placeholders: counts.placeholder,
    uniquePlaceholderTitles: placeholderTitles.size,
    placeholderTitleList: [...placeholderTitles].sort(),
    runtimePhotos: provenance.length,
  };
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    path.join(outputDirectory, "photo-coverage.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const escape = (value: unknown) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  const cards = provenance
    .sort((a: { assetId: string }, b: { assetId: string }) =>
      a.assetId.localeCompare(b.assetId),
    )
    .map((entry: Record<string, unknown>) => {
      const id = String(entry.assetId);
      const sourcePath =
        entry.source === "pexels"
          ? `../../assets/photography/derived/${id}-thumb.webp`
          : `../../assets/photography/${id}-thumb.webp`;
      const mappings = [...(mapped.get(id) ?? [])].slice(0, 8);
      const credit =
        entry.source === "pexels"
          ? `<a href="${escape(entry.photographerProfileUrl)}" rel="noreferrer">${escape(entry.photographer)}</a> · <a href="${escape(entry.pexelsPhotoUrl)}" rel="noreferrer">Pexels photo</a>`
          : "Original generated FauxGo asset";
      return `<article><img src="${sourcePath}" alt="${escape(entry.alt)}" loading="lazy"><h2>${escape(id)}</h2><p class="tags">${escape((entry.tags as string[]).join(" · "))}</p><p>${credit}</p><p><strong>Mapped examples</strong><br>${mappings.length ? mappings.map(escape).join("<br>") : "Not currently selected by the resolver"}</p></article>`;
    })
    .join("\n");
  await writeFile(
    path.join(outputDirectory, "photo-review.html"),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>FauxGo photo review</title><style>body{margin:0;background:#f7f4ee;color:#171716;font:14px/1.45 system-ui;padding:32px}header{max-width:900px;margin:auto auto 28px}h1{font-size:32px;margin:0 0 8px}.summary{color:#625f59}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;max-width:1500px;margin:auto}article{background:#fffdfc;border:1px solid #e8e3dc;border-radius:14px;overflow:hidden;padding-bottom:16px}img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;background:#e8e3dc}h2,p{margin:12px 16px 0}h2{font-size:16px;overflow-wrap:anywhere}.tags{color:#8d3d31}a{color:#a13c34}strong{font-weight:700}</style></head><body><header><h1>FauxGo photography review</h1><p class="summary">${escape(report.runtimePhotos)} local images · ${escape(report.catalogItems)} generated catalog items · high ${escape(report.highConfidence)} · family ${escape(report.family)} · generic ${escape(report.generic)} · placeholder ${escape(report.placeholders)}. This development artifact is not production navigation.</p></header><main class="grid">${cards}</main></body></html>`,
  );

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
