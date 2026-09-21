import { describe, expect, it } from "vitest";
import { getMenu, getMerchants, getVehicle } from "./catalog";
import { calculateCommercePrice, calculateMobilityPrice } from "./pricing";
import {
  createDemoRoute,
  distanceBetween,
  getRouteMapPresentation,
  interpolateRoute,
} from "./route";
import {
  convertMinor,
  defaultPreferences,
  inferRegion,
  normalizePreferences,
  resolveAppearance,
} from "./preferences";
import { normalizePaymentMethod, paymentMethodsFor } from "./payments";
import {
  addCartItem,
  createInitialState,
  normalizeCart,
  normalizeLocalPreferences,
} from "./state";
import { manualPlace, requestForegroundLocation } from "./location";
import { regions } from "./regions";
import { createSimulation, startManualJourney } from "./simulation";
import {
  createTimeline,
  deriveSnapshot,
  pendingNotificationEvents,
} from "./timeline";
import { canShowCompletionAd } from "./ads";

const merchant = getMerchants("IN")[0];
const item = getMenu(merchant.id)[0];
const line = {
  itemId: item.id,
  quantity: 2,
  optionIds: ["regular"],
  substitution: "best-match",
};
const quote = calculateCommercePrice({
  lines: [line],
  items: [item],
  region: "IN",
});
const build = (serviceType: "ride" | "eats" = "ride") =>
  createSimulation({
    id: "test",
    serviceType,
    title: "Test",
    subtitle: "Test route",
    region: "IN",
    pace: "quick",
    origin: regions.IN.places[0],
    destination: regions.IN.places[1],
    vehicleId: serviceType === "ride" ? "economy" : "send-cycle",
    quote,
    now: 1000,
  });

describe("pricing and currencies", () => {
  it("keeps totals in integer minor units with explainable components", () => {
    expect(quote.lines[0].amountMinor).toBe(item.priceMinor.IN * 2);
    expect(quote.totalMinor).toBe(
      quote.lines.reduce((sum, entry) => sum + entry.amountMinor, 0),
    );
    expect(
      quote.lines.every((entry) => Number.isSafeInteger(entry.amountMinor)),
    ).toBe(true);
    const empty = calculateCommercePrice({
      lines: [],
      items: [item],
      region: "IN",
    });
    expect(empty.totalMinor).toBe(0);
    const input = {
      region: "US" as const,
      vehicle: getVehicle("economy")!,
      distanceMeters: 5000,
      durationSeconds: 900,
      seed: "same",
    };
    expect(calculateMobilityPrice(input)).toEqual(
      calculateMobilityPrice(input),
    );
    expect(calculateMobilityPrice(input).totalMinor).toBeGreaterThan(850);
    expect(() =>
      calculateMobilityPrice({ ...input, distanceMeters: NaN }),
    ).toThrow();
  });
  it("bounds promotions and quantity and includes modifiers", () => {
    expect(() =>
      calculateCommercePrice({
        lines: [{ ...line, quantity: NaN }],
        items: [item],
        region: "IN",
      }),
    ).toThrow();
    const withExtra = calculateCommercePrice({
      lines: [{ ...line, optionIds: ["generous"] }],
      items: [item],
      region: "IN",
    });
    expect(withExtra.totalMinor).toBeGreaterThan(quote.totalMinor);
    const discounted = calculateCommercePrice({
      lines: [line],
      items: [item],
      region: "IN",
      promotionMinor: 99999999,
    });
    expect(discounted.totalMinor).toBeGreaterThanOrEqual(0);
    expect(convertMinor(100, "USD", "INR")).toBe(8400);
    expect(convertMinor(1000, "GBP", "GBP")).toBe(1000);
  });
});

describe("geographic routes", () => {
  it("follows the polyline and clamps invalid or out-of-range progress", () => {
    const route = createDemoRoute([77.59, 12.97], [77.62, 13.01], "route");
    expect(route.points).toHaveLength(25);
    expect(interpolateRoute(route, -1).coordinate).toEqual(route.points[0]);
    expect(interpolateRoute(route, 2).coordinate[0]).toBeCloseTo(
      route.points.at(-1)![0],
    );
    expect(interpolateRoute(route, NaN).coordinate).toEqual(route.points[0]);
    const middle = interpolateRoute(route, 0.5);
    expect(distanceBetween(route.points[0], middle.coordinate)).toBeGreaterThan(
      0,
    );
    expect(middle.heading).toBeGreaterThanOrEqual(0);
    expect(middle.heading).toBeLessThan(360);
    expect(
      interpolateRoute(createDemoRoute([0, 0], [0, 0]), 0.5).coordinate,
    ).toEqual([0, 0]);
  });

  it("never presents a moving road vehicle on illustrative fallback geometry", () => {
    const demo = createDemoRoute([77.59, 12.97], [77.62, 13.01]);
    expect(getRouteMapPresentation(demo, "ride")).toEqual({
      approximate: true,
      showVehicle: false,
    });
    expect(getRouteMapPresentation(demo, "eats")).toEqual({
      approximate: true,
      showVehicle: false,
    });
    expect(getRouteMapPresentation(demo, "air")).toEqual({
      approximate: false,
      showVehicle: true,
    });
    expect(
      getRouteMapPresentation({ ...demo, source: "provider" }, "ride"),
    ).toEqual({ approximate: false, showVehicle: true });
  });
});

describe("timestamp state machine", () => {
  it("waits indefinitely for manual boarding and resumes from the explicit timestamp", () => {
    const ride = build();
    const waiting = deriveSnapshot(ride, 1_000_000);
    expect(waiting.awaitingManualStart).toBe(true);
    expect(waiting.complete).toBe(false);
    expect(waiting.routeProgress).toBe(0);
    expect(startManualJourney(ride, 1000)).toEqual(ride);
    const started = startManualJourney(ride, 1_000_000);
    expect(deriveSnapshot(started, 1_000_000).stage.id).toBe("travelling");
    const restored = JSON.parse(JSON.stringify(started));
    expect(deriveSnapshot(restored, 2_000_000).complete).toBe(true);
    expect(
      deriveSnapshot({ ...ride, manualStartedAt: 1001 }, 1_000_000)
        .awaitingManualStart,
    ).toBe(true);
  });
  it("holds delivery movement until pickup and reconciles each milestone once", () => {
    const eats = build("eats");
    expect(deriveSnapshot(eats, 2000).routeProgress).toBe(0);
    const pickup = eats.stages.find((stage) => stage.id === "picked-up")!;
    expect(
      deriveSnapshot(eats, eats.createdAt + pickup.offsetSeconds * 1000 + 1000)
        .routeProgress,
    ).toBeGreaterThan(0);
    const events = pendingNotificationEvents(eats, 1000, 50000);
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
    expect(pendingNotificationEvents(eats, 50000, 50000)).toEqual([]);
  });
  it("has ordered, spaced stages at every pace for every service", () => {
    for (const service of [
      "eats",
      "market",
      "ride",
      "black",
      "air",
      "send",
    ] as const)
      for (const pace of ["quick", "relaxed", "realtime"] as const) {
        const timeline = createTimeline(service, pace);
        for (const anchor of ["created", "manual-start"] as const) {
          const stages = timeline.filter((stage) => stage.anchor === anchor);
          for (let index = 1; index < stages.length; index++)
            expect(stages[index].offsetSeconds).toBeGreaterThan(
              stages[index - 1].offsetSeconds,
            );
        }
        expect(timeline.at(-1)!.id).toBe("complete");
      }
  });
});

describe("preferences, storage and demo payment boundary", () => {
  it("starts light even on a dark OS and persists explicit appearance/rail choices", () => {
    expect(resolveAppearance(defaultPreferences().appearance, "dark")).toBe(
      "light",
    );
    const restored = normalizePreferences(
      JSON.parse(
        JSON.stringify({
          appearance: "dark",
          sidebarExpanded: true,
          region: "GB",
          currency: "GBP",
        }),
      ),
    );
    expect(restored.appearance).toBe("dark");
    expect(restored.sidebarExpanded).toBe(true);
    expect(resolveAppearance("system", "dark")).toBe("dark");
    expect(inferRegion("en-US")).toBe("US");
    expect(inferRegion("en-GB")).toBe("GB");
    expect(inferRegion("malformed_XX")).toBe("IN");
  });
  it("projects allowed fields and rejects sensitive payment-shaped values", () => {
    const state = normalizeLocalPreferences({
      paymentMethodId: "4111111111111111",
      card: { pan: "4111111111111111", cvv: "123" },
      preferences: { region: "US", upiPin: "123456" },
      cart: [{ itemId: 12, quantity: 2 }],
    });
    expect(state.paymentMethodId).toBe("demo-card-4242");
    expect(JSON.stringify(state)).not.toContain("4111111111111111");
    expect(JSON.stringify(state)).not.toContain("upiPin");
    expect(state.cart).toEqual([]);
    expect(normalizePaymentMethod("demo-upi", "GB")).toBe("demo-card-4242");
    expect(
      paymentMethodsFor("GB", "ride").some(
        (method) => method.id === "demo-upi",
      ),
    ).toBe(false);
    expect(paymentMethodsFor("IN", "ride")[0].id).toBe("demo-upi");
  });
  it("validates quantities, options and merchant boundaries", () => {
    expect(normalizeCart([{ ...line, quantity: -1 }])).toEqual([]);
    expect(
      normalizeCart([{ ...line, optionIds: ["credential", "generous"] }])[0]
        .optionIds,
    ).toEqual(["generous"]);
    expect(addCartItem([line], { ...line, quantity: 25 })[0].quantity).toBe(25);
    const other = getMenu(getMerchants("IN")[1].id)[0];
    expect(normalizeCart([line, { ...line, itemId: other.id }])).toHaveLength(
      1,
    );
    expect(createInitialState("US").preferences.currency).toBe("USD");
  });
});

describe("location outcomes and ad gates", () => {
  it("supports denied, unavailable, successful and manual location without background access", async () => {
    expect(
      (
        await requestForegroundLocation(
          {
            requestPermission: async () => false,
            currentPosition: async () => {
              throw new Error("must not run");
            },
          },
          false,
        )
      ).status,
    ).toBe("denied");
    expect(
      (
        await requestForegroundLocation(
          {
            requestPermission: async () => true,
            currentPosition: async () => {
              throw new Error("GPS");
            },
          },
          false,
        )
      ).status,
    ).toBe("unavailable");
    const success = await requestForegroundLocation(
      {
        requestPermission: async () => true,
        currentPosition: async () => [77.6, 12.9],
      },
      true,
    );
    expect(success.status).toBe("success");
    expect(manualPlace("Home", "My address", [77, 12])?.label).toBe("Home");
    expect(manualPlace("", "address", [77, 12])).toBeUndefined();
    expect(manualPlace("Home", "address", [999, 12])).toBeUndefined();
  });
  it("protects new users, declined consent and daily frequency", () => {
    const now = 200_000_000;
    const allowed = {
      enabled: true,
      consent: "non-personalized" as const,
      onboardingCompletedAt: 1,
      completionTimestamps: [],
      now,
    };
    expect(canShowCompletionAd(allowed)).toBe(true);
    expect(
      canShowCompletionAd({ ...allowed, onboardingCompletedAt: now - 1000 }),
    ).toBe(false);
    expect(canShowCompletionAd({ ...allowed, consent: "disabled" })).toBe(
      false,
    );
    expect(
      canShowCompletionAd({
        ...allowed,
        completionTimestamps: [now - 100, now - 200],
      }),
    ).toBe(false);
  });
});
