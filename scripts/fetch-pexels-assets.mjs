import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { pexelsTargets } from "./pexels-targets.mjs";

const root = process.cwd();
const provenancePath = path.join(root, "assets/photography/provenance.json");
const searchCache = new Map();
const selectedPhotoIds = new Set();
const forceTargets = new Set(process.argv.slice(2));
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function localKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY;
  let file;
  try {
    file = await readFile(path.join(root, ".env.local"), "utf8");
  } catch {
    throw new Error("PEXELS_API_KEY is missing. Add it to ignored .env.local.");
  }
  for (const raw of file.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^PEXELS_API_KEY\s*=\s*(.*)$/);
    if (!match) continue;
    const value = match[1]
      .trim()
      .replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
    if (value) return value;
  }
  throw new Error("PEXELS_API_KEY is missing. Add it to ignored .env.local.");
}

async function fetchWithRetry(url, options, label) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      if (response.status === 401 || response.status === 403)
        throw new Error(`Pexels rejected authorization while ${label}.`);
      if (response.ok) return response;
      if (response.status !== 429 && response.status < 500)
        throw new Error(
          `Pexels returned HTTP ${response.status} while ${label}.`,
        );
      if (attempt === 2)
        throw new Error(`Pexels remained unavailable while ${label}.`);
      const retryAfter = Number(response.headers.get("retry-after"));
      await sleep(
        Number.isFinite(retryAfter)
          ? Math.min(retryAfter * 1000, 30_000)
          : 1000 * 2 ** attempt,
      );
    } catch (error) {
      if (
        attempt === 2 ||
        (error instanceof Error && error.message.includes("authorization"))
      )
        throw error;
      await sleep(1000 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`Unable to finish ${label}.`);
}

function words(value) {
  return new Set(
    String(value)
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? [],
  );
}

function candidateScore(photo, target, index) {
  const alt = String(photo.alt ?? "").toLowerCase();
  if (
    /\b(logo|watermark|signage|portrait|woman|women|man|men|girl|boy|people|person|family|chef|brand|branded|label|letters)\b/.test(
      alt,
    )
  )
    return -Infinity;
  if (
    !Number.isFinite(photo.width) ||
    photo.width < 1200 ||
    photo.width <= photo.height
  )
    return -Infinity;
  const altWords = words(alt);
  const queryWords = words(`${target.query} ${target.tags.join(" ")}`);
  let overlap = 0;
  for (const word of queryWords)
    if (word.length > 2 && altWords.has(word)) overlap += 1;
  return overlap * 20 + Math.min(photo.width / photo.height, 2) * 3 - index;
}

async function candidates(target, key) {
  if (searchCache.has(target.query)) return searchCache.get(target.query);
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", target.query);
  url.searchParams.set("orientation", target.orientation);
  url.searchParams.set("size", "large");
  url.searchParams.set("per_page", "15");
  const response = await fetchWithRetry(
    url,
    { headers: { Authorization: key, Accept: "application/json" } },
    `searching for ${target.id}`,
  );
  const body = await response.json();
  if (!Array.isArray(body.photos))
    throw new Error(`Invalid Pexels response for ${target.id}.`);
  searchCache.set(target.query, body.photos);
  await sleep(125);
  return body.photos;
}

function safeImageURL(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "images.pexels.com")
    throw new Error("Pexels returned an unexpected image host.");
  return url;
}

async function download(photo, destination, target) {
  const imageURL = safeImageURL(photo.src.large2x ?? photo.src.large);
  const response = await fetchWithRetry(
    imageURL,
    { headers: { Accept: "image/*" } },
    `downloading ${target.id}`,
  );
  const type = response.headers.get("content-type") ?? "";
  if (!/^image\/(jpeg|png|webp)(?:;|$)/i.test(type))
    throw new Error(`Unexpected content type for ${target.id}.`);
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > 15_000_000)
    throw new Error(`Image for ${target.id} is too large.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 15_000_000 || bytes.length < 10_000)
    throw new Error(`Invalid image size for ${target.id}.`);
  await writeFile(destination, bytes);
}

const key = await localKey();
let provenance = [];
try {
  provenance = JSON.parse(await readFile(provenancePath, "utf8"));
  if (!Array.isArray(provenance)) provenance = [];
} catch {}
for (const entry of provenance)
  if (entry.source === "pexels") selectedPhotoIds.add(entry.pexelsPhotoId);

let imported = 0;
for (const [index, target] of pexelsTargets.entries()) {
  if (!/^(food|grocery|merchant)-[a-z0-9-]+$/.test(target.id))
    throw new Error(`Unsafe target ID: ${target.id}`);
  const directory = path.join(root, "assets/photography/source", target.type);
  const destination = path.join(directory, `${target.id}-master.jpg`);
  const existing = provenance.find(
    (entry) => entry.assetId === target.id && entry.source === "pexels",
  );
  if (existing && !forceTargets.has(target.id)) {
    try {
      await access(destination);
      continue;
    } catch {}
  }
  await mkdir(directory, { recursive: true });
  const photos = await candidates(target, key);
  const photo = photos
    .map((candidate, candidateIndex) => ({
      candidate,
      score: candidateScore(candidate, target, candidateIndex),
    }))
    .filter(
      ({ candidate, score }) =>
        score > -Infinity && !selectedPhotoIds.has(candidate.id),
    )
    .sort((a, b) => b.score - a.score)[0]?.candidate;
  if (!photo)
    throw new Error(
      `No suitable unique Pexels candidate found for ${target.id}.`,
    );
  await download(photo, destination, target);
  selectedPhotoIds.add(photo.id);
  provenance = provenance.filter((entry) => entry.assetId !== target.id);
  provenance.push({
    assetId: target.id,
    source: "pexels",
    sourceLabel: "Pexels Photos API",
    pexelsPhotoId: photo.id,
    photographer: photo.photographer,
    photographerProfileUrl: photo.photographer_url,
    pexelsPhotoUrl: photo.url,
    originalImageUrl: photo.src.original,
    importedAt: new Date().toISOString(),
    tags: target.tags,
    usage: target.type,
    orientation: target.orientation,
    scope: target.scope,
    alt: photo.alt ?? target.query,
  });
  provenance.sort((a, b) => a.assetId.localeCompare(b.assetId));
  await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
  imported += 1;
  console.log(`[${index + 1}/${pexelsTargets.length}] Imported ${target.id}`);
}

console.log(
  `Pexels import complete: ${imported} new, ${pexelsTargets.length - imported} already present.`,
);
