import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

// MapLibre 6 workers are separate ESM files. Metro cannot infer their import.meta URL after bundling.
// Serve the installed package's exact worker/shared pair from our own origin, never a third-party CDN.
const destination = resolve("public/vendor/maplibre");
await mkdir(destination, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  await copyFile(resolve("node_modules/maplibre-gl/dist", file), resolve(destination, file));
}
await copyFile(resolve("node_modules/maplibre-gl/LICENSE.txt"), resolve(destination, "LICENSE.txt"));
console.log("Prepared same-origin MapLibre worker assets.");
