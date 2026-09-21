import { useEffect, useState } from "react";
import { Coordinate, Route } from "@/core/models";
import { createDemoRoute } from "@/core/route";
import { requestRoadRoute, roadRoutingEnabled } from "@/platform/geography";

const cache = new Map<string, Route>();
export function useRoute(
  origin: Coordinate,
  destination: Coordinate | undefined,
  road = true,
) {
  const key = JSON.stringify([origin, destination, road]);
  const [resolved, setResolved] = useState<{
    key: string;
    route?: Route;
    failed: boolean;
  }>();
  const [attempt, setAttempt] = useState(0);
  const enabled = Boolean(destination && road && roadRoutingEnabled);
  const cached = cache.get(key);
  const demo = destination
    ? createDemoRoute(origin, destination, key)
    : undefined;
  useEffect(() => {
    if (!enabled || cache.has(key)) return;
    const controller = new AbortController();
    const [start, end] = JSON.parse(key) as [Coordinate, Coordinate, boolean];
    requestRoadRoute(start, end, key, controller.signal)
      .then((route) => {
        if (controller.signal.aborted) return;
        if (route) {
          cache.set(key, route);
          if (cache.size > 20) cache.delete(cache.keys().next().value!);
        }
        setResolved({ key, route, failed: !route });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResolved({ key, failed: true });
      });
    return () => controller.abort();
  }, [key, enabled, attempt]);
  const current = resolved?.key === key ? resolved : undefined;
  return {
    route: cached ?? current?.route ?? demo,
    loading: enabled && !cached && !current,
    failed: current?.failed ?? false,
    retry: () => {
      setResolved(undefined);
      setAttempt((value) => value + 1);
    },
  };
}
