import { describe, expect, it } from "vitest";
import { getMenu, getMerchants, getVehicle } from "./catalog";
import { quoteBasket } from "./commerce";
import { normalizeSimulation, restoreState } from "./persistence";
import { createSimulation } from "./simulation";
import { createInitialState, cartLineKey, normalizeCart } from "./state";
import { regions } from "./regions";
import { calculateMobilityPrice } from "./pricing";
import { deriveSnapshot } from "./timeline";

const ride = () =>
  createSimulation({
    id: "test-ride",
    serviceType: "ride",
    title: "Economy",
    subtitle: "Museum",
    region: "IN",
    pace: "quick",
    origin: regions.IN.places[0],
    destination: regions.IN.places[1],
    vehicleId: "economy",
    now: 1000,
    quote: calculateMobilityPrice({
      region: "IN",
      vehicle: getVehicle("economy")!,
      distanceMeters: 1000,
      durationSeconds: 300,
      seed: "test",
    }),
  });

describe("versioned local persistence", () => {
  it("projects a complete v2 state without retaining unknown credentials", () => {
    const simulation = ride();
    const restored = restoreState(
      {
        ...createInitialState("IN"),
        preferences: { appearance: "dark", sidebarExpanded: true },
        cardNumber: "discard-me",
        simulations: [
          {
            ...simulation,
            secret: "discard-me",
            operator: { ...simulation.operator, phone: "discard-me" },
            quote: { ...simulation.quote, cvv: "discard-me" },
          },
        ],
      },
      "IN",
    );
    expect(restored.preferences.appearance).toBe("dark");
    expect(restored.preferences.sidebarExpanded).toBe(true);
    expect(restored.simulations).toHaveLength(1);
    expect(JSON.stringify(restored)).not.toContain("discard-me");
  });
  it("rejects corrupt quotes and service-incompatible vehicles", () => {
    expect(
      normalizeSimulation({
        ...ride(),
        quote: { ...ride().quote, totalMinor: -1 },
      }),
    ).toBeUndefined();
    expect(
      normalizeSimulation({
        ...ride(),
        quote: { ...ride().quote, totalMinor: 7 },
      }),
    ).toBeUndefined();
    expect(
      normalizeSimulation({ ...ride(), vehicle: getVehicle("air-plane") }),
    ).toBeUndefined();
  });
  it("regenerates unsafe routes and canonical timeline data", () => {
    const restored = normalizeSimulation({
      ...ride(),
      route: { points: [[NaN, 4]], durationSeconds: Infinity },
      stages: [{ title: "Injected", offsetSeconds: -1 }],
    })!;
    expect(restored.route.points.length).toBeGreaterThan(2);
    expect(restored.stages[0].title).toBe("Finding a driver");
  });
  it("preserves old receipts with their original dollar totals", () => {
    const restored = restoreState(
      {
        onboardingComplete: true,
        settings: { haptics: false },
        cart: [{ itemId: "retired-item", quantity: 2 }],
        simulations: [
          {
            id: "legacy-1",
            serviceId: "food",
            title: "Old favorite",
            subtitle: "2 items",
            total: 19.75,
            createdAt: 1000,
            origin: "Old restaurant",
            destination: "Old home",
          },
        ],
      },
      "GB",
    );
    expect(restored.onboardingComplete).toBe(true);
    expect(restored.preferences.haptics).toBe(false);
    expect(restored.cart).toEqual([]);
    expect(restored.simulations[0].quote.totalMinor).toBe(1975);
    expect(restored.simulations[0].quote.currency).toBe("USD");
    expect(deriveSnapshot(restored.simulations[0], 100000).complete).toBe(true);
  });
  it("bounds retained history and deduplicates identifiers", () => {
    const restored = restoreState(
      {
        ...createInitialState(),
        simulations: Array.from({ length: 150 }, () => ride()),
      },
      "IN",
    );
    expect(restored.simulations).toHaveLength(1);
  });
});

describe("basket integration", () => {
  it("keeps different options, notes and substitution choices distinct", () => {
    const item = getMenu(getMerchants("IN")[0].id)[0];
    const line = normalizeCart([{ itemId: item.id, quantity: 1 }])[0];
    expect(cartLineKey(line)).not.toBe(
      cartLineKey({ ...line, notes: "Less spicy" }),
    );
    expect(cartLineKey(line)).not.toBe(
      cartLineKey({ ...line, substitution: "refund" }),
    );
  });
  it("applies promoted item discounts consistently to basket and checkout quotes", () => {
    const item = getMenu(getMerchants("IN")[0].id)[0];
    const lines = normalizeCart([{ itemId: item.id, quantity: 2 }]);
    const quote = quoteBasket(lines, "IN");
    expect(quote.lines.find((line) => line.id === "offer")?.amountMinor).toBe(
      -Math.round(item.priceMinor.IN * 2 * 0.2),
    );
    expect(quote.lines.reduce((sum, line) => sum + line.amountMinor, 0)).toBe(
      quote.totalMinor,
    );
  });
});
