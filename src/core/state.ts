import { AppStateV2, CartLine, RegionCode, SavedPlace } from "./models";
import { getCatalogItem } from "./catalog";
import { defaultPreferences, normalizePreferences } from "./preferences";
import { normalizePaymentMethod } from "./payments";
import { validCoordinate } from "./location";
import { regions } from "./regions";

export function createInitialState(region: RegionCode = "IN"): AppStateV2 {
  return {
    schemaVersion: 2,
    onboardingComplete: false,
    profile: { displayName: "Guest", mode: "guest" },
    preferences: defaultPreferences(region),
    savedPlaces: [],
    selectedPlace: regions[region].places[0],
    recentPlaces: [],
    paymentMethodId: normalizePaymentMethod(undefined, region),
    favorites: [],
    cartService: null,
    cart: [],
    simulations: [],
    completionAdTimestamps: [],
  };
}

export function normalizePlace(value: unknown): SavedPlace | undefined {
  if (!value || typeof value !== "object") return undefined;
  const place = value as Record<string, unknown>;
  if (
    typeof place.id !== "string" ||
    place.id.length > 180 ||
    typeof place.label !== "string" ||
    !place.label.trim() ||
    typeof place.address !== "string" ||
    !validCoordinate(place.coordinate)
  )
    return undefined;
  const kind = ["home", "work", "recent", "custom"].includes(String(place.kind))
    ? (place.kind as SavedPlace["kind"])
    : "custom";
  return {
    id: place.id,
    label: place.label.slice(0, 80),
    address: place.address.slice(0, 180),
    coordinate: [place.coordinate[0], place.coordinate[1]],
    kind,
  };
}

export function normalizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const lines: CartLine[] = [];
  let merchantId: string | undefined;
  for (const candidate of value.slice(0, 60)) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = getCatalogItem(candidate.itemId);
    if (
      !item ||
      !item.available ||
      !Number.isInteger(candidate.quantity) ||
      candidate.quantity <= 0 ||
      (merchantId && merchantId !== item.merchantId)
    )
      continue;
    merchantId = item.merchantId;
    const allowedOptions =
      item.optionGroups?.flatMap((group) =>
        group.options.map((option) => option.id),
      ) ?? [];
    const requested = Array.isArray(candidate.optionIds)
      ? candidate.optionIds.filter(
          (option: unknown): option is string =>
            typeof option === "string" && allowedOptions.includes(option),
        )
      : [];
    const optionIds = (item.optionGroups ?? []).flatMap((group) => {
      const selected = group.options
        .filter((option) => requested.includes(option.id))
        .slice(0, group.maximum)
        .map((option) => option.id);
      return selected.length || !group.required
        ? selected
        : [group.options[0].id];
    });
    const substitution =
      candidate.substitution === "refund" ||
      item.substitutionIds?.includes(candidate.substitution)
        ? candidate.substitution
        : "best-match";
    const notes =
      typeof candidate.notes === "string"
        ? candidate.notes.replace(/[\u0000-\u001f]/g, "").slice(0, 240)
        : undefined;
    lines.push({
      itemId: item.id,
      quantity: Math.min(25, candidate.quantity),
      optionIds,
      substitution,
      ...(notes ? { notes } : {}),
    });
  }
  return lines;
}

export function cartLineKey(line: CartLine) {
  return JSON.stringify([
    line.itemId,
    [...line.optionIds].sort(),
    line.substitution,
    line.notes ?? "",
  ]);
}

export function addCartItem(current: CartLine[], next: CartLine) {
  const valid = normalizeCart([next])[0];
  if (!valid) return current;
  const merchant = getCatalogItem(valid.itemId)!.merchantId;
  const matching = current.filter(
    (line) => getCatalogItem(line.itemId)?.merchantId === merchant,
  );
  const key = cartLineKey(valid);
  const exists = matching.some((line) => cartLineKey(line) === key);
  return exists
    ? matching.map((line) =>
        cartLineKey(line) === key
          ? { ...line, quantity: Math.min(25, line.quantity + valid.quantity) }
          : line,
      )
    : [...matching, valid];
}

// State is projected field-by-field so unknown data (including credentials) is never retained.
export function normalizeLocalPreferences(
  value: unknown,
  region: RegionCode = "IN",
): Omit<AppStateV2, "simulations"> {
  const defaults = createInitialState(region);
  const candidate =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const preferences = normalizePreferences(candidate.preferences, region);
  const places = (input: unknown) =>
    Array.isArray(input)
      ? input
          .slice(0, 30)
          .map(normalizePlace)
          .filter((place): place is SavedPlace => Boolean(place))
      : [];
  const cart = normalizeCart(candidate.cart);
  const profile =
    candidate.profile && typeof candidate.profile === "object"
      ? (candidate.profile as Record<string, unknown>)
      : {};
  return {
    schemaVersion: 2,
    onboardingComplete: candidate.onboardingComplete === true,
    onboardingCompletedAt:
      typeof candidate.onboardingCompletedAt === "number" &&
      Number.isFinite(candidate.onboardingCompletedAt)
        ? candidate.onboardingCompletedAt
        : undefined,
    profile: {
      mode: "guest",
      displayName:
        typeof profile.displayName === "string"
          ? profile.displayName.slice(0, 40)
          : "Guest",
    },
    preferences,
    savedPlaces: places(candidate.savedPlaces),
    recentPlaces: places(candidate.recentPlaces),
    selectedPlace:
      normalizePlace(candidate.selectedPlace) ??
      regions[preferences.region].places[0],
    paymentMethodId: normalizePaymentMethod(
      candidate.paymentMethodId,
      preferences.region,
    ),
    cart,
    cartService: cart.length
      ? getCatalogItem(cart[0].itemId)!.serviceType
      : null,
    favorites: Array.isArray(candidate.favorites)
      ? candidate.favorites.slice(0, 200).flatMap((entry) => {
          if (
            !entry ||
            !["item", "merchant", "place"].includes(entry.kind) ||
            typeof entry.targetId !== "string" ||
            entry.targetId.length > 180 ||
            typeof entry.createdAt !== "number" ||
            !Number.isFinite(entry.createdAt)
          )
            return [];
          return [
            {
              id: `${entry.kind}-${entry.targetId}`,
              kind: entry.kind,
              targetId: entry.targetId,
              createdAt: entry.createdAt,
            },
          ];
        })
      : defaults.favorites,
    completionAdTimestamps: Array.isArray(candidate.completionAdTimestamps)
      ? candidate.completionAdTimestamps
          .filter(
            (timestamp): timestamp is number =>
              typeof timestamp === "number" && Number.isFinite(timestamp),
          )
          .slice(-20)
      : [],
  };
}
