import { describe, expect, it } from "vitest";
import { parsePlaceResults, parseRoadRoute, providerBase } from "./geography";
const origin = [77.59, 12.97] as const,
  destination = [77.6, 12.98] as const;
const route = {
  code: "Ok",
  routes: [
    {
      distance: 1800,
      duration: 420,
      geometry: { type: "LineString", coordinates: [origin, destination] },
    },
  ],
};
describe("geography trust boundaries", () => {
  it("allows only HTTPS provider roots without embedded credentials", () => {
    expect(providerBase("https://maps.example/service")?.href).toBe(
      "https://maps.example/service/",
    );
    for (const value of [
      "http://maps.example",
      "javascript:alert(1)",
      "https://user:secret@maps.example",
      "https://maps.example?key=secret",
      "invalid",
    ])
      expect(providerBase(value)).toBeUndefined();
  });
  it("accepts bounded road geometry and rejects unrelated or invalid routes", () => {
    expect(parseRoadRoute(route, origin, destination, "route")?.source).toBe(
      "provider",
    );
    expect(
      parseRoadRoute({ code: "NoRoute" }, origin, destination, "route"),
    ).toBeUndefined();
    expect(parseRoadRoute(route, [0, 0], destination, "route")).toBeUndefined();
    expect(
      parseRoadRoute(
        { ...route, routes: [{ ...route.routes[0], duration: Infinity }] },
        origin,
        destination,
        "route",
      ),
    ).toBeUndefined();
  });
  it("projects geocoder results without retaining arbitrary data", () => {
    const results = parsePlaceResults({
      features: [
        {
          geometry: { type: "Point", coordinates: origin },
          properties: { name: "Library", city: "Bengaluru", secret: "discard" },
        },
        {
          geometry: { type: "Point", coordinates: [181, 30] },
          properties: { name: "Invalid" },
        },
      ],
    });
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("Library");
    expect(JSON.stringify(results)).not.toContain("discard");
    expect(parsePlaceResults(null)).toEqual([]);
  });
});
