import { Coordinate, SavedPlace } from "./models";

export type LocationResult =
  | { status: "success"; place: SavedPlace }
  | { status: "denied" | "unavailable"; message: string };
export type ForegroundLocationPort = {
  requestPermission: () => Promise<boolean>;
  currentPosition: (precise: boolean) => Promise<Coordinate>;
};

export function validCoordinate(value: unknown): value is Coordinate {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((part) => typeof part === "number" && Number.isFinite(part)) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
  );
}

export async function requestForegroundLocation(
  port: ForegroundLocationPort,
  precise: boolean,
): Promise<LocationResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (!(await port.requestPermission()))
      return {
        status: "denied",
        message:
          "Location access is off. You can enter an address or choose a point on the map.",
      };
    const coordinate = await Promise.race([
      port.currentPosition(precise),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Location timed out")),
          12000,
        );
      }),
    ]);
    if (!validCoordinate(coordinate)) throw new Error("Invalid position");
    return {
      status: "success",
      place: {
        id: "current-location",
        label: "Current location",
        address: "Your selected position",
        coordinate,
        kind: "custom",
      },
    };
  } catch {
    return {
      status: "unavailable",
      message:
        "We couldn’t find your location. Try again or choose an address manually.",
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function manualPlace(
  label: string,
  address: string,
  coordinate: Coordinate,
): SavedPlace | undefined {
  const clean = (text: string) =>
    text
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, 180);
  if (!clean(label) || !clean(address) || !validCoordinate(coordinate))
    return undefined;
  return {
    id: `place-${coordinate[0].toFixed(5)}-${coordinate[1].toFixed(5)}`,
    label: clean(label),
    address: clean(address),
    coordinate,
    kind: "custom",
  };
}
