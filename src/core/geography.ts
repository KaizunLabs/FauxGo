import { Coordinate, Route, SavedPlace } from "./models";
import { validCoordinate, manualPlace } from "./location";
import { distanceBetween } from "./route";

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const clean = (value: unknown) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u001f]/g, "").slice(0, 180)
    : "";

export function providerBase(value: string | undefined): URL | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return;
    url.pathname = url.pathname.replace(/\/?$/, "/");
    return url;
  } catch {
    return;
  }
}

export function parseRoadRoute(
  value: unknown,
  origin: Coordinate,
  destination: Coordinate,
  id: string,
): Route | undefined {
  const data = record(value);
  if (data.code !== "Ok" || !Array.isArray(data.routes)) return;
  const first = record(data.routes[0]);
  const geometry = record(first.geometry);
  if (
    geometry.type !== "LineString" ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length < 2 ||
    geometry.coordinates.length > 10000 ||
    !geometry.coordinates.every(validCoordinate)
  )
    return;
  const points: Coordinate[] = geometry.coordinates.map((point) => [
    point[0],
    point[1],
  ]);
  if (
    typeof first.distance !== "number" ||
    !Number.isFinite(first.distance) ||
    first.distance < 0 ||
    first.distance > 50_000_000 ||
    typeof first.duration !== "number" ||
    !Number.isFinite(first.duration) ||
    first.duration <= 0 ||
    first.duration > 604800
  )
    return;
  // Reject unrelated/corrupt routes rather than showing a route in the wrong city.
  if (
    distanceBetween(origin, points[0]) > 2000 ||
    distanceBetween(destination, points.at(-1)!) > 2000
  )
    return;
  return {
    id,
    source: "provider",
    points,
    distanceMeters: first.distance,
    durationSeconds: first.duration,
    attribution: "Road estimate · OpenStreetMap data",
  };
}

export function parsePlaceResults(value: unknown): SavedPlace[] {
  const data = record(value);
  if (!Array.isArray(data.features)) return [];
  const places = data.features.slice(0, 10).flatMap((raw) => {
    const feature = record(raw);
    const geometry = record(feature.geometry);
    const properties = record(feature.properties);
    if (geometry.type !== "Point" || !validCoordinate(geometry.coordinates))
      return [];
    const address = [
      clean(properties.housenumber),
      clean(properties.street),
      clean(properties.city),
      clean(properties.state),
      clean(properties.country),
    ]
      .filter(Boolean)
      .join(", ");
    const label = clean(properties.name) || clean(properties.street) || address;
    const place = manualPlace(label, address || label, geometry.coordinates);
    return place ? [place] : [];
  });
  return [...new Map(places.map((place) => [place.id, place])).values()];
}
