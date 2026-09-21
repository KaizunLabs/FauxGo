import { afterEach, describe, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("geography network adapters", () => {
  it("makes no request when optional providers are absent", async () => {
    vi.stubEnv("EXPO_PUBLIC_ROUTING_MODE", "demo");
    vi.stubEnv("EXPO_PUBLIC_GEOCODING_BASE_URL", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const api = await import("./geography");
    expect(
      await api.requestRoadRoute([77.59, 12.97], [77.6, 12.98], "route"),
    ).toBeUndefined();
    expect(await api.searchPlaces("Library")).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("sends only the submitted search text and returns projected places", async () => {
    vi.stubEnv("EXPO_PUBLIC_GEOCODING_BASE_URL", "https://places.example/");
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          features: [
            {
              geometry: { type: "Point", coordinates: [77.59, 12.97] },
              properties: { name: "Library", city: "Bengaluru" },
            },
          ],
        }),
    });
    vi.stubGlobal("fetch", fetch);
    const api = await import("./geography");
    expect((await api.searchPlaces("Central Library"))[0].label).toBe(
      "Library",
    );
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain("q=Central+Library");
    expect(url).not.toContain("lat=");
    expect(url).not.toContain("lon=");
    expect(options.credentials).toBe("omit");
  });
  it("validates road responses and reports provider failures to the fallback caller", async () => {
    vi.stubEnv("EXPO_PUBLIC_ROUTING_MODE", "osrm");
    vi.stubEnv("EXPO_PUBLIC_ROUTING_BASE_URL", "https://routes.example/");
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            code: "Ok",
            routes: [
              {
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [77.59, 12.97],
                    [77.6, 12.98],
                  ],
                },
                distance: 1600,
                duration: 300,
              },
            ],
          }),
      })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fetch);
    const api = await import("./geography");
    expect(
      (await api.requestRoadRoute([77.59, 12.97], [77.6, 12.98], "route"))
        ?.source,
    ).toBe("provider");
    expect(fetch.mock.calls[0][0]).toContain("route/v1/driving/");
    await expect(
      api.requestRoadRoute([77.59, 12.97], [77.6, 12.98], "route"),
    ).rejects.toThrow("unavailable");
  });
});
