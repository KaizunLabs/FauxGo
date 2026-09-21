import sharp from "sharp";

const jobs = [
  ["assets/brand/fauxgo-icon.svg", "assets/images/fauxgo-icon.png", 1024, 1024],
  ["assets/brand/fauxgo-adaptive-foreground.svg", "assets/images/fauxgo-adaptive-foreground.png", 1024, 1024],
  ["assets/brand/fauxgo-mark.svg", "assets/images/favicon.png", 64, 64],
  ["assets/brand/fauxgo-og.svg", "assets/images/fauxgo-og.png", 1200, 630],
];

await Promise.all(
  jobs.map(([source, destination, width, height]) =>
    sharp(source).resize(width, height).png({ compressionLevel: 9 }).toFile(destination),
  ),
);

console.log(`Generated ${jobs.length} brand assets from SVG masters.`);
