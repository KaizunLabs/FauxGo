import { describe, expect, it } from "vitest";
import {
  catalogEntryCount,
  discoverMerchants,
  getCatalogItem,
  getMenu,
  getMerchant,
  getMerchants,
  getVehicles,
} from "./catalog";
import { cuisines } from "./catalog-seeds";
import { searchCatalog } from "./search";

describe("synthetic catalog", () => {
  it("provides thousands of deterministic entries with reversible stable IDs", () => {
    expect(
      ["IN", "US", "GB"].reduce(
        (sum, code) => sum + catalogEntryCount(code as "IN"),
        0,
      ),
    ).toBeGreaterThan(5000);
    const merchants = getMerchants("IN");
    expect(new Set(merchants.map((merchant) => merchant.id)).size).toBe(
      merchants.length,
    );
    for (const merchant of merchants) {
      expect(getMerchant(merchant.id)).toEqual(merchant);
      const menu = getMenu(merchant.id);
      expect(menu.length).toBeGreaterThanOrEqual(12);
      expect(getMenu(merchant.id)).toEqual(menu);
      expect(new Set(menu.map((item) => item.id)).size).toBe(menu.length);
      for (const item of menu) {
        expect(item.imageKey).toBeTruthy();
        expect(
          Object.values(item.priceMinor).every(
            (price) => Number.isSafeInteger(price) && price > 0,
          ),
        ).toBe(true);
      }
    }
    const item = getMenu(merchants[0].id)[0];
    expect(getCatalogItem(item.id)).toEqual(item);
  });
  it("changes regional ordering without removing cuisine access", () => {
    expect(getMerchants("IN")[0].cuisineId).toBe("north-indian");
    expect(getMerchants("US")[0].cuisineId).toBe("burgers");
    for (const code of ["IN", "US", "GB"] as const)
      expect(
        new Set(
          getMerchants(code)
            .filter((merchant) => merchant.serviceType === "eats")
            .map((merchant) => merchant.cuisineId),
        ).size,
      ).toBe(cuisines.length);
    expect(
      getVehicles("ride", "IN").some((vehicle) => vehicle.id === "auto"),
    ).toBe(true);
    expect(
      getVehicles("ride", "US").some((vehicle) => vehicle.id === "auto"),
    ).toBe(false);
  });
  it("searches item/merchant names and paginates without duplicates", () => {
    const first = searchCatalog("paneer", "IN", [], 0, 8);
    const second = searchCatalog("paneer", "IN", [], 8, 8);
    expect(first.results).toHaveLength(8);
    expect(first.hasMore).toBe(true);
    expect(
      first.results.every(
        (result) => !second.results.some((entry) => entry.id === result.id),
      ),
    ).toBe(true);
    expect(
      searchCatalog("Saffron Table", "IN").results.some(
        (item) => item.target === "merchant",
      ),
    ).toBe(true);
    expect(searchCatalog("zzz-no-results-zzz", "IN").results).toEqual([]);
    expect(searchCatalog("   ", "IN").results).toEqual([]);
  });
  it("filters substantively and rejects malformed deep links", () => {
    const fastest = discoverMerchants("IN", "eats", "all", "fastest");
    expect(fastest[0].etaMinutes[0]).toBeLessThanOrEqual(
      fastest.at(-1)!.etaMinutes[0],
    );
    expect(
      discoverMerchants("IN", "eats", "all", "offers").every(
        (merchant) => merchant.offer,
      ),
    ).toBe(true);
    expect(getMerchant("__proto__")).toBeUndefined();
    expect(getCatalogItem("missing~dish~1")).toBeUndefined();
  });
});
