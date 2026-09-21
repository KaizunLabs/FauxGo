import { CurrencyCode, RegionCode, UserPreference } from "./models";
import { isCurrencyCode, isRegionCode, regions } from "./regions";

export function inferRegion(locale: string | null | undefined): RegionCode {
  try {
    const region = new Intl.Locale(locale || "en-IN").region;
    if (isRegionCode(region)) return region;
  } catch {
    /* A malformed device locale must not prevent first launch. */
  }
  return "IN";
}

export function defaultPreferences(region: RegionCode = "IN"): UserPreference {
  return {
    appearance: "light",
    sidebarExpanded: false,
    units: region === "US" ? "mi" : "km",
    regionSource: "locale",
    preciseLocation: false,
    deliveryNotifications: true,
    rideNotifications: true,
    region,
    currency: regions[region].currency,
    pace: "quick",
    haptics: true,
    sound: false,
    notifications: false,
    reducedMotion: "system",
    adConsent: "disabled",
  };
}

function member<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" && options.includes(value as T)
    ? (value as T)
    : fallback;
}

export function normalizePreferences(
  value: unknown,
  fallbackRegion: RegionCode = "IN",
): UserPreference {
  const object =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const region = isRegionCode(object.region) ? object.region : fallbackRegion;
  const defaults = defaultPreferences(region);
  return {
    ...defaults,
    appearance: member(object.appearance, ["light", "dark", "system"], "light"),
    sidebarExpanded: object.sidebarExpanded === true,
    units: member(object.units, ["km", "mi"], defaults.units),
    regionSource: member(
      object.regionSource,
      ["locale", "manual", "location"],
      "locale",
    ),
    preciseLocation: object.preciseLocation === true,
    deliveryNotifications: object.deliveryNotifications !== false,
    rideNotifications: object.rideNotifications !== false,
    currency: isCurrencyCode(object.currency)
      ? object.currency
      : defaults.currency,
    pace: member(object.pace, ["quick", "relaxed", "realtime"], "quick"),
    haptics: object.haptics !== false,
    sound: object.sound === true,
    notifications: object.notifications === true,
    reducedMotion: member(
      object.reducedMotion,
      ["system", "on", "off"],
      "system",
    ),
    adConsent: member(
      object.adConsent,
      ["unset", "non-personalized", "personalized", "disabled"],
      "disabled",
    ),
  };
}

export function resolveAppearance(
  preference: UserPreference["appearance"],
  system: "light" | "dark" | null | undefined,
) {
  return preference === "system" ? (system ?? "light") : preference;
}

// Fixed reference conversion for display only, never a live exchange-rate claim.
const referenceUnitsPerUSD: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 84,
  GBP: 0.79,
};
export function convertMinor(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
) {
  return Math.round(
    (amount / referenceUnitsPerUSD[from]) * referenceUnitsPerUSD[to],
  );
}
