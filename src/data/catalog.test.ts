import { describe, expect, it } from "vitest";
import { catalogItems, mobilityOptions, services } from "./catalog";

const prohibitedBrandFragments = [
  "uber",
  "lyft",
  "doordash",
  "zomato",
  "swiggy",
  "blinkit",
  "ola",
  "instacart",
];
describe("fictional catalog integrity", () => {
  it("covers every promised service with at least two choices", () => {
    expect(services).toHaveLength(6);
    for (const service of services) {
      const choices =
        service.kind === "commerce"
          ? catalogItems.filter((item) => item.serviceId === service.id)
          : mobilityOptions.filter((option) => option.serviceId === service.id);
      expect(choices.length).toBeGreaterThanOrEqual(2);
    }
  });
  it("keeps identifiers unique", () => {
    const ids = [...services, ...catalogItems, ...mobilityOptions].map(
      (entry) => entry.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("does not include prohibited real-service brands in product content", () => {
    const content = JSON.stringify({
      services,
      catalogItems,
      mobilityOptions,
    }).toLowerCase();
    for (const brand of prohibitedBrandFragments)
      expect(content).not.toMatch(new RegExp(`\\b${brand}\\b`, "i"));
  });
});
