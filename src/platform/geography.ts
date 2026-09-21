import { Coordinate } from "@/core/models";
import {
  parsePlaceResults,
  parseRoadRoute,
  providerBase,
} from "@/core/geography";

const routingBase = providerBase(process.env.EXPO_PUBLIC_ROUTING_BASE_URL);
const geocodingBase = providerBase(process.env.EXPO_PUBLIC_GEOCODING_BASE_URL);
export const roadRoutingEnabled =
  process.env.EXPO_PUBLIC_ROUTING_MODE === "osrm" && Boolean(routingBase);
export const placeSearchEnabled = Boolean(geocodingBase);
export const placeSearchProvider = geocodingBase?.hostname ?? "";

async function fetchJSON(url: URL, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 8000);
  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      credentials: "omit",
      headers: { Accept: "application/json" },
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error("Geography service unavailable");
    const content = await response.text();
    if (content.length > 2_000_000)
      throw new Error("Geography response too large");
    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export async function requestRoadRoute(
  origin: Coordinate,
  destination: Coordinate,
  id: string,
  signal?: AbortSignal,
) {
  if (!roadRoutingEnabled || !routingBase) return undefined;
  const coordinates = [origin, destination]
    .map((point) => point.map((part) => part.toFixed(5)).join(","))
    .join(";");
  const url = new URL(`route/v1/driving/${coordinates}`, routingBase);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");
  return parseRoadRoute(await fetchJSON(url, signal), origin, destination, id);
}

export async function searchPlaces(query: string, signal?: AbortSignal) {
  if (!geocodingBase || query.trim().length < 3) return [];
  const url = new URL("api/", geocodingBase);
  url.searchParams.set("q", query.trim().slice(0, 180));
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "en");
  // Location bias is deliberately omitted: a text search need not transmit saved coordinates.
  return parsePlaceResults(await fetchJSON(url, signal));
}
