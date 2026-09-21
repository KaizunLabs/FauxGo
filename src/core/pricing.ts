import {
  CartLine,
  CatalogItem,
  PriceBreakdown,
  RegionCode,
  VehicleCategory,
} from "./models";
import { regions } from "./regions";

const roundMinor = (value: number) => Math.round(value);

export function itemUnitPrice(
  item: CatalogItem,
  line: CartLine,
  region: RegionCode,
) {
  return (
    item.priceMinor[region] +
    (item.optionGroups ?? [])
      .flatMap((group) => group.options)
      .filter((option) => line.optionIds.includes(option.id))
      .reduce(
        (total, option) => total + (option.priceDeltaMinor[region] ?? 0),
        0,
      )
  );
}

export function deterministicUnit(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function calculateCommercePrice(input: {
  lines: CartLine[];
  items: CatalogItem[];
  region: RegionCode;
  promotionMinor?: number;
}): PriceBreakdown {
  const { lines, items, region } = input;
  if (
    lines.some(
      (line) =>
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 25,
    )
  )
    throw new Error("Invalid cart quantity");
  if (
    input.promotionMinor !== undefined &&
    (!Number.isSafeInteger(input.promotionMinor) || input.promotionMinor < 0)
  )
    throw new Error("Invalid promotion");
  const profile = regions[region];
  const subtotal = lines.reduce((sum, line) => {
    const item = items.find((candidate) => candidate.id === line.itemId);
    if (!item) return sum;
    const optionDelta = (item.optionGroups ?? [])
      .flatMap((group) => group.options)
      .filter((option) => line.optionIds.includes(option.id))
      .reduce(
        (total, option) => total + (option.priceDeltaMinor[region] ?? 0),
        0,
      );
    return (
      sum +
      (item.priceMinor[region] + optionDelta) *
        Math.max(0, Math.min(25, line.quantity))
    );
  }, 0);
  const serviceFee = roundMinor(subtotal * profile.serviceFeeRate);
  const tax = roundMinor(subtotal * profile.taxRate);
  const promotion = Math.min(Math.max(0, input.promotionMinor ?? 0), subtotal);
  const linesOut = [
    {
      id: "subtotal",
      label: "Subtotal",
      amountMinor: subtotal,
      kind: "base" as const,
    },
    {
      id: "delivery",
      label: "Delivery fee",
      amountMinor: subtotal ? profile.deliveryFeeMinor : 0,
      kind: "fee" as const,
    },
    {
      id: "service",
      label: "Service fee",
      amountMinor: serviceFee,
      kind: "fee" as const,
    },
    ...(tax
      ? [
          {
            id: "tax",
            label: "Estimated tax",
            amountMinor: tax,
            kind: "tax" as const,
          },
        ]
      : []),
    ...(promotion
      ? [
          {
            id: "offer",
            label: "FauxGo offer",
            amountMinor: -promotion,
            kind: "discount" as const,
          },
        ]
      : []),
  ];
  return {
    currency: profile.currency,
    lines: linesOut,
    totalMinor: linesOut.reduce((sum, line) => sum + line.amountMinor, 0),
    explanation:
      "Reference simulation pricing; no live merchant price or payment is used.",
  };
}

export function calculateMobilityPrice(input: {
  region: RegionCode;
  vehicle: VehicleCategory;
  distanceMeters: number;
  durationSeconds: number;
  seed: string;
}): PriceBreakdown {
  const profile = regions[input.region];
  if (
    ![
      input.distanceMeters,
      input.durationSeconds,
      input.vehicle.multiplier,
    ].every((value) => Number.isFinite(value) && value >= 0)
  )
    throw new Error("Invalid route pricing input");
  const distanceKm = Math.max(0, input.distanceMeters) / 1000;
  const durationMinutes = Math.max(0, input.durationSeconds) / 60;
  const rawBase =
    profile.ride.baseMinor +
    distanceKm * profile.ride.perKmMinor +
    durationMinutes * profile.ride.perMinuteMinor;
  const vehicleAmount = roundMinor(rawBase * input.vehicle.multiplier);
  const demandMultiplier = 0.96 + deterministicUnit(input.seed) * 0.16;
  const demandAdjustment = roundMinor(vehicleAmount * (demandMultiplier - 1));
  const beforeMinimum = vehicleAmount + demandAdjustment;
  const minimum = roundMinor(
    profile.ride.minimumMinor * input.vehicle.multiplier,
  );
  const total = Math.max(minimum, beforeMinimum);
  return {
    currency: profile.currency,
    lines: [
      {
        id: "route",
        label: `${distanceKm.toFixed(1)} km · ${Math.round(durationMinutes)} min`,
        amountMinor: vehicleAmount,
        kind: "base",
      },
      ...(demandAdjustment
        ? [
            {
              id: "demand",
              label: "Demand adjustment",
              amountMinor: demandAdjustment,
              kind: "adjustment" as const,
            },
          ]
        : []),
      ...(total > beforeMinimum
        ? [
            {
              id: "minimum",
              label: "Regional minimum adjustment",
              amountMinor: total - beforeMinimum,
              kind: "adjustment" as const,
            },
          ]
        : []),
    ],
    totalMinor: total,
    explanation:
      "Deterministic estimate based on route, duration, vehicle and region; it is not a live fare.",
  };
}
