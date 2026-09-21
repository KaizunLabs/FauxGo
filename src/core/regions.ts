import { CurrencyCode, RegionCode, SavedPlace } from "./models";

export type RegionProfile = {
  code: RegionCode;
  label: string;
  locale: string;
  currency: CurrencyCode;
  taxRate: number;
  serviceFeeRate: number;
  deliveryFeeMinor: number;
  ride: {
    baseMinor: number;
    perKmMinor: number;
    perMinuteMinor: number;
    minimumMinor: number;
  };
  center: readonly [number, number];
  places: SavedPlace[];
};

export const regions: Record<RegionCode, RegionProfile> = {
  IN: {
    code: "IN",
    label: "India",
    locale: "en-IN",
    currency: "INR",
    taxRate: 0.05,
    serviceFeeRate: 0.04,
    deliveryFeeMinor: 3900,
    ride: {
      baseMinor: 4500,
      perKmMinor: 1650,
      perMinuteMinor: 250,
      minimumMinor: 6500,
    },
    center: [77.5946, 12.9716],
    places: [
      {
        id: "in-home",
        label: "Home",
        address: "12 Rain Tree Lane, Bengaluru",
        coordinate: [77.5908, 12.9757],
        kind: "home",
      },
      {
        id: "in-museum",
        label: "Museum of Small Things",
        address: "Museum Road, Bengaluru",
        coordinate: [77.6085, 12.9743],
        kind: "recent",
      },
      {
        id: "in-station",
        label: "Northlight Station",
        address: "Millers Road, Bengaluru",
        coordinate: [77.5921, 12.9912],
        kind: "recent",
      },
    ],
  },
  US: {
    code: "US",
    label: "United States",
    locale: "en-US",
    currency: "USD",
    taxRate: 0.0825,
    serviceFeeRate: 0.05,
    deliveryFeeMinor: 299,
    ride: {
      baseMinor: 260,
      perKmMinor: 145,
      perMinuteMinor: 32,
      minimumMinor: 850,
    },
    center: [-122.4194, 37.7749],
    places: [
      {
        id: "us-home",
        label: "Home",
        address: "41 Juniper Street, San Francisco",
        coordinate: [-122.4232, 37.7768],
        kind: "home",
      },
      {
        id: "us-library",
        label: "Harbor Library",
        address: "Civic Center, San Francisco",
        coordinate: [-122.4156, 37.7793],
        kind: "recent",
      },
      {
        id: "us-garden",
        label: "Willow Garden",
        address: "Hayes Valley, San Francisco",
        coordinate: [-122.4261, 37.7732],
        kind: "recent",
      },
    ],
  },
  GB: {
    code: "GB",
    label: "United Kingdom",
    locale: "en-GB",
    currency: "GBP",
    taxRate: 0,
    serviceFeeRate: 0.05,
    deliveryFeeMinor: 249,
    ride: {
      baseMinor: 320,
      perKmMinor: 175,
      perMinuteMinor: 38,
      minimumMinor: 900,
    },
    center: [-0.1276, 51.5072],
    places: [
      {
        id: "gb-home",
        label: "Home",
        address: "8 Willow Mews, London",
        coordinate: [-0.1342, 51.5104],
        kind: "home",
      },
      {
        id: "gb-square",
        label: "Juniper Square",
        address: "Bloomsbury, London",
        coordinate: [-0.1239, 51.5193],
        kind: "recent",
      },
      {
        id: "gb-station",
        label: "Northlight Station",
        address: "South Bank, London",
        coordinate: [-0.1162, 51.5031],
        kind: "recent",
      },
    ],
  },
};

export const defaultRegion: RegionCode = "IN";

export function isRegionCode(value: unknown): value is RegionCode {
  return value === "IN" || value === "US" || value === "GB";
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === "INR" || value === "USD" || value === "GBP";
}

export function currencyForRegion(region: RegionCode): CurrencyCode {
  return regions[region].currency;
}

export function formatMinor(
  amountMinor: number,
  region: RegionCode,
  currency?: CurrencyCode,
) {
  const profile = regions[region];
  return new Intl.NumberFormat(profile.locale, {
    style: "currency",
    currency: currency ?? profile.currency,
    maximumFractionDigits:
      currency === "INR" || (!currency && profile.currency === "INR") ? 0 : 2,
  }).format(amountMinor / 100);
}
