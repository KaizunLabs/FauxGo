import { accessSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { photoMetadata } from "@/data/photo-metadata.generated";
import { catalogImageTags, resolvePhoto } from "./photo-resolver";

describe("semantic photography", () => {
  it("has unique, valid provenance and every required derivative", () => {
    const provenance = JSON.parse(
      readFileSync(path.resolve("assets/photography/provenance.json"), "utf8"),
    );
    expect(
      new Set(provenance.map((entry: { assetId: string }) => entry.assetId))
        .size,
    ).toBe(provenance.length);
    expect(new Set(photoMetadata.map((entry) => entry.id)).size).toBe(
      photoMetadata.length,
    );
    for (const entry of provenance) {
      expect(entry.assetId).toMatch(/^[a-z0-9-]+$/);
      expect(entry.tags.length).toBeGreaterThan(0);
      expect(["original-generated", "pexels"]).toContain(entry.source);
      if (entry.source === "pexels") {
        expect(entry.pexelsPhotoId).toEqual(expect.any(Number));
        expect(entry.photographer).toEqual(expect.any(String));
        expect(entry.pexelsPhotoUrl).toMatch(/^https:\/\/www\.pexels\.com\//);
      }
      const directory = entry.source === "pexels" ? "derived" : "";
      for (const size of ["thumb", "card", "hero"])
        accessSync(
          path.resolve(
            "assets/photography",
            directory,
            `${entry.assetId}-${size}.webp`,
          ),
        );
    }
  });

  it("prefers exact semantics and remains deterministic", () => {
    const cases = [
      ["Paneer makhani", "North Indian", "food", "food-paneer-curry"],
      ["Dal tadka", "North Indian", "food", "food-dal-lentils"],
      ["Butter naan", "North Indian", "food", "food-naan-flatbread"],
      ["Whole milk · 1 L", "Dairy & eggs", "grocery", "grocery-milk"],
      [
        "Sparkling water · 6 pack",
        "Beverages",
        "grocery",
        "grocery-sparkling-water",
      ],
    ] as const;
    for (const [title, family, usage, expected] of cases) {
      const tags = catalogImageTags(title, family, usage);
      expect(resolvePhoto(tags, "stable-id", usage).id).toBe(expected);
      expect(resolvePhoto(tags, "stable-id", usage)).toEqual(
        resolvePhoto(tags, "stable-id", usage),
      );
    }
  });

  it("uses a neutral placeholder when semantics do not match", () => {
    expect(
      resolvePhoto(
        catalogImageTags("Unmapped object", "Mystery", "food"),
        "mystery",
        "food",
      ),
    ).toEqual({ confidence: "placeholder", score: 0 });
    expect(
      photoMetadata.every(
        (entry) => !/\p{Extended_Pictographic}/u.test(entry.id),
      ),
    ).toBe(true);
  });

  it("does not force an exact photo from broad category words", () => {
    expect(
      resolvePhoto(
        catalogImageTags("Ground coffee · 250 g", "Beverages", "grocery"),
        "coffee",
        "grocery",
      ),
    ).toEqual({ confidence: "placeholder", score: 0 });
    expect(
      resolvePhoto(
        catalogImageTags("Sweetcorn · 500 g", "Frozen", "grocery"),
        "sweetcorn",
        "grocery",
      ),
    ).toEqual({ confidence: "placeholder", score: 0 });
    expect(
      resolvePhoto(
        catalogImageTags("Chickpea curry", "Vegan", "food"),
        "chickpea",
        "food",
      ).id,
    ).toBe("food-chole");
  });

  it("varies merchant heroes deterministically within a suitable family", () => {
    const tags = catalogImageTags("Pizza", "Pizza", "merchant");
    const resolved = Array.from({ length: 4 }, (_, index) =>
      resolvePhoto(tags, `us-pizza-${index}`, "merchant"),
    );
    expect(new Set(resolved.map(({ id }) => id)).size).toBe(4);
    expect(resolved.every(({ id }) => id?.includes("pizza"))).toBe(true);
    expect(resolvePhoto(tags, "pizza-merchant-4", "merchant")).toEqual(
      resolvePhoto(tags, "pizza-merchant-4", "merchant"),
    );
  });

  it("rejects ingredient overlap when the dish form conflicts", () => {
    expect(
      resolvePhoto(
        catalogImageTags("Pepperoni pizza", "Pizza", "food"),
        "pepperoni",
        "food",
      ).confidence,
    ).toBe("placeholder");
    expect(
      resolvePhoto(
        catalogImageTags("Tomato burrata salad", "Italian", "food"),
        "us-pizza-0~dish~7",
        "food",
      ).id,
    ).toBe("food-caprese");
  });

  it("prefers neutral fallbacks to misleading grocery imagery", () => {
    expect(
      resolvePhoto(
        catalogImageTags("Tomato soup · 400 g", "Quick meals", "grocery"),
        "tomato-soup",
        "grocery",
      ).id,
    ).not.toBe("grocery-tomatoes");
    expect(
      resolvePhoto(
        catalogImageTags("Bin liners · 20 pack", "Household", "grocery"),
        "bin-liners",
        "grocery",
      ).confidence,
    ).toBe("placeholder");
  });
});
