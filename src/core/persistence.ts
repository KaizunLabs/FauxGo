import { getVehicle } from "./catalog";
import {
  AppStateV2,
  PriceBreakdown,
  RegionCode,
  ServiceType,
  Simulation,
} from "./models";
import { isCurrencyCode, isRegionCode, regions } from "./regions";
import { validCoordinate } from "./location";
import { normalizeLocalPreferences, normalizePlace } from "./state";
import { assignOperator } from "./simulation";
import { createDemoRoute } from "./route";
import { createTimeline } from "./timeline";
import { normalizePaymentMethod } from "./payments";

const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const text = (value: unknown, limit = 180) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u001f]/g, "").slice(0, limit)
    : "";
const timestamp = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const amount = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isSafeInteger(value) &&
  Math.abs(value) <= 100_000_000;
const serviceIds: ServiceType[] = [
  "eats",
  "market",
  "ride",
  "black",
  "air",
  "send",
];

function normalizeQuote(value: unknown): PriceBreakdown | undefined {
  const quote = object(value);
  if (
    !isCurrencyCode(quote.currency) ||
    !amount(quote.totalMinor) ||
    quote.totalMinor < 0 ||
    !Array.isArray(quote.lines) ||
    quote.lines.length > 20
  )
    return;
  const lines: PriceBreakdown["lines"] = [];
  for (const raw of quote.lines) {
    const line = object(raw);
    if (
      !amount(line.amountMinor) ||
      !["base", "fee", "tax", "discount", "adjustment"].includes(
        String(line.kind),
      )
    )
      return;
    lines.push({
      id: text(line.id, 40),
      label: text(line.label, 120),
      amountMinor: line.amountMinor,
      kind: line.kind as PriceBreakdown["lines"][number]["kind"],
    });
  }
  if (
    lines.reduce((sum, line) => sum + line.amountMinor, 0) !== quote.totalMinor
  )
    return;
  return {
    currency: quote.currency,
    lines,
    totalMinor: quote.totalMinor,
    explanation: text(quote.explanation, 300),
  };
}

export function normalizeSimulation(value: unknown): Simulation | undefined {
  const entry = object(value);
  const serviceType = serviceIds.find((id) => id === entry.serviceType);
  const region = entry.region;
  const origin = normalizePlace(entry.origin),
    destination = normalizePlace(entry.destination);
  const vehicle = getVehicle(text(object(entry.vehicle).id));
  const quote = normalizeQuote(entry.quote);
  if (
    !text(entry.id, 100) ||
    !serviceType ||
    !isRegionCode(region) ||
    !origin ||
    !destination ||
    !vehicle ||
    !quote ||
    !timestamp(entry.createdAt)
  )
    return;
  if (
    !["eats", "market"].includes(serviceType) &&
    vehicle.serviceType !== serviceType
  )
    return;
  const pace =
    entry.pace === "relaxed" || entry.pace === "realtime"
      ? entry.pace
      : "quick";
  const candidateRoute = object(entry.route);
  const route = createDemoRoute(
    origin.coordinate,
    destination.coordinate,
    text(entry.id, 100),
  );
  if (
    Array.isArray(candidateRoute.points) &&
    candidateRoute.points.length >= 2 &&
    candidateRoute.points.length <= 10000 &&
    candidateRoute.points.every(validCoordinate) &&
    timestamp(candidateRoute.distanceMeters) &&
    timestamp(candidateRoute.durationSeconds) &&
    candidateRoute.distanceMeters <= 50_000_000 &&
    candidateRoute.durationSeconds <= 604800
  ) {
    route.points = candidateRoute.points.map((point) => [point[0], point[1]]);
    route.distanceMeters = candidateRoute.distanceMeters;
    route.durationSeconds = candidateRoute.durationSeconds;
    route.source = candidateRoute.source === "provider" ? "provider" : "demo";
    route.attribution = text(candidateRoute.attribution, 300);
  }
  const stages = createTimeline(serviceType, pace, route.durationSeconds);
  const gate = stages.find((stage) => stage.manualActionLabel);
  const manualStartedAt =
    timestamp(entry.manualStartedAt) &&
    gate &&
    entry.manualStartedAt >= entry.createdAt + gate.offsetSeconds * 1000
      ? entry.manualStartedAt
      : undefined;
  const rating = object(entry.rating);
  return {
    schemaVersion: 2,
    id: text(entry.id, 100),
    serviceType,
    region,
    pace,
    title: text(entry.title, 120),
    subtitle: text(entry.subtitle),
    createdAt: entry.createdAt,
    manualStartedAt,
    completedAt:
      timestamp(entry.completedAt) && entry.completedAt >= entry.createdAt
        ? entry.completedAt
        : undefined,
    origin,
    destination,
    vehicle,
    quote,
    route,
    stages,
    operator: assignOperator(region, serviceType, text(entry.id, 100)),
    itemCount:
      Number.isInteger(entry.itemCount) && Number(entry.itemCount) > 0
        ? Math.min(1500, Number(entry.itemCount))
        : undefined,
    packageDescription: text(entry.packageDescription, 240) || undefined,
    paymentMethodId: normalizePaymentMethod(entry.paymentMethodId, region),
    rating:
      [1, 2, 3, 4, 5].includes(Number(rating.score)) &&
      timestamp(rating.createdAt)
        ? {
            score: Number(rating.score) as 1 | 2 | 3 | 4 | 5,
            tags: Array.isArray(rating.tags)
              ? rating.tags.slice(0, 6).map((tag) => text(tag, 40))
              : [],
            createdAt: rating.createdAt,
          }
        : undefined,
  };
}

function migrateLegacySimulation(value: unknown): Simulation | undefined {
  const old = object(value);
  const mapping: Record<string, ServiceType> = {
    food: "eats",
    grocery: "market",
    ride: "ride",
    premium: "black",
    sky: "air",
    courier: "send",
  };
  const serviceType = mapping[String(old.serviceId)];
  if (
    !serviceType ||
    !timestamp(old.createdAt) ||
    typeof old.total !== "number" ||
    !Number.isFinite(old.total) ||
    old.total < 0
  )
    return;
  const vehicleId = {
    eats: "send-cycle",
    market: "send-cycle",
    ride: "economy",
    black: "black-sedan",
    air: "air-rotor",
    send: "send-cycle",
  }[serviceType];
  const origin = {
    ...regions.US.places[0],
    label: text(old.origin) || "Pickup",
  };
  const destination = {
    ...regions.US.places[1],
    label: text(old.destination) || "Destination",
  };
  const totalMinor = Math.round(old.total * 100);
  const migrated = normalizeSimulation({
    ...old,
    serviceType,
    region: "US",
    pace: "quick",
    origin,
    destination,
    vehicle: { id: vehicleId },
    quote: {
      currency: "USD",
      totalMinor,
      lines: [
        {
          id: "legacy",
          label: "Original total",
          amountMinor: totalMinor,
          kind: "base",
        },
      ],
      explanation:
        "Receipt retained from the previous FauxGo catalog. No payment was made.",
    },
  });
  if (!migrated) return;
  // Earlier releases auto-completed every story after 60 seconds. Preserve those receipts as completed.
  migrated.completedAt = old.createdAt + 60000;
  return migrated;
}

export function restoreState(
  value: unknown,
  fallbackRegion: RegionCode,
): AppStateV2 {
  const candidate = object(value);
  const legacy = candidate.schemaVersion !== 2;
  const base = normalizeLocalPreferences(
    legacy
      ? {
          onboardingComplete: candidate.onboardingComplete,
          preferences: { haptics: object(candidate.settings).haptics },
        }
      : candidate,
    fallbackRegion,
  );
  const simulations = Array.isArray(candidate.simulations)
    ? candidate.simulations
        .slice(0, 100)
        .map(legacy ? migrateLegacySimulation : normalizeSimulation)
        .filter((item): item is Simulation => Boolean(item))
    : [];
  return {
    ...base,
    simulations: [
      ...new Map(simulations.map((item) => [item.id, item])).values(),
    ],
  };
}
