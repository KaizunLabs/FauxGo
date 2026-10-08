import { Coordinate, Route, ServiceType, Simulation } from "./models";
import type { SimulationSnapshot } from "./timeline";

const EARTH_RADIUS_METERS = 6_371_000;
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const degrees = (value: number) => (value * 180) / Math.PI;

export function distanceBetween(a: Coordinate, b: Coordinate): number {
  const latitudeDelta = radians(b[1] - a[1]);
  const longitudeDelta = radians(b[0] - a[0]);
  const latitudeA = radians(a[1]);
  const latitudeB = radians(b[1]);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDelta / 2) ** 2;
  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.asin(Math.sqrt(Math.min(1, Math.max(0, value))))
  );
}

export function bearingBetween(a: Coordinate, b: Coordinate): number {
  const longitudeDelta = radians(b[0] - a[0]);
  const latitudeA = radians(a[1]);
  const latitudeB = radians(b[1]);
  const y = Math.sin(longitudeDelta) * Math.cos(latitudeB);
  const x =
    Math.cos(latitudeA) * Math.sin(latitudeB) -
    Math.sin(latitudeA) * Math.cos(latitudeB) * Math.cos(longitudeDelta);
  return (degrees(Math.atan2(y, x)) + 360) % 360;
}

function routeLength(points: Coordinate[]) {
  return points
    .slice(1)
    .reduce(
      (total, point, index) => total + distanceBetween(points[index], point),
      0,
    );
}

export function createDemoRoute(
  origin: Coordinate,
  destination: Coordinate,
  seed = "fauxgo",
): Route {
  const curveDirection =
    seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % 2
      ? 1
      : -1;
  const dx = destination[0] - origin[0];
  const dy = destination[1] - origin[1];
  const bend = 0.16 * curveDirection;
  const control: Coordinate = [
    (origin[0] + destination[0]) / 2 - dy * bend,
    (origin[1] + destination[1]) / 2 + dx * bend,
  ];
  const points: Coordinate[] = Array.from({ length: 25 }, (_, index) => {
    const t = index / 24;
    const inverse = 1 - t;
    return [
      inverse * inverse * origin[0] +
        2 * inverse * t * control[0] +
        t * t * destination[0],
      inverse * inverse * origin[1] +
        2 * inverse * t * control[1] +
        t * t * destination[1],
    ];
  });
  const distanceMeters = routeLength(points);
  return {
    id: `demo-${[...origin, ...destination].map((part) => part.toFixed(5)).join("-")}`,
    source: "demo",
    points,
    distanceMeters,
    durationSeconds: Math.max(300, Math.round((distanceMeters / 7.8) * 1.22)),
  };
}

export function getRouteMapPresentation(
  route: Route,
  serviceType: ServiceType,
) {
  const approximate = route.source === "demo" && serviceType !== "air";
  return { approximate, showVehicle: true };
}

const pickupStages: Partial<Record<ServiceType, [string, string, string]>> = {
  eats: ["courier-assigned", "at-restaurant", "picked-up"],
  market: ["courier-assigned", "picked-up", "picked-up"],
  ride: ["assigned", "arrived", "travelling"],
  black: ["assigned", "arrived", "travelling"],
  send: ["assigned", "pickup", "collected"],
};

export function getTrackingLeg(
  simulation: Simulation,
  snapshot: SimulationSnapshot,
  now: number,
) {
  const ids = pickupStages[simulation.serviceType];
  if (!ids || !simulation.approachRoute)
    return {
      route: simulation.route,
      progress: snapshot.routeProgress,
      phase: "journey" as const,
      showVehicle: true,
    };
  const created = simulation.stages.filter(
    (stage) => stage.anchor === "created",
  );
  const assignment = created.find((stage) => stage.id === ids[0]);
  const arrival = created.find((stage) => stage.id === ids[1]);
  const departure = created.find((stage) => stage.id === ids[2]);
  const elapsed = Math.max(0, (now - simulation.createdAt) / 1000);
  const journeyStarted =
    snapshot.complete ||
    (simulation.serviceType === "ride" || simulation.serviceType === "black"
      ? simulation.manualStartedAt !== undefined &&
        simulation.manualStartedAt <= now &&
        !snapshot.awaitingManualStart
      : departure !== undefined && elapsed >= departure.offsetSeconds);
  if (journeyStarted)
    return {
      route: simulation.route,
      progress: snapshot.routeProgress,
      phase: "journey" as const,
      showVehicle: true,
    };
  const start = assignment?.offsetSeconds ?? 0;
  const end = arrival?.offsetSeconds ?? start + 1;
  return {
    route: simulation.approachRoute,
    progress: Math.max(
      0,
      Math.min(1, (elapsed - start) / Math.max(1, end - start)),
    ),
    phase: "pickup" as const,
    showVehicle: elapsed >= start,
  };
}

function interpolateHeading(from: number, to: number, amount: number) {
  const delta = ((to - from + 540) % 360) - 180;
  return (from + delta * amount + 360) % 360;
}

export function interpolateRoute(route: Route, rawProgress: number) {
  const progress = Math.max(
    0,
    Math.min(1, Number.isFinite(rawProgress) ? rawProgress : 0),
  );
  if (route.points.length < 2)
    return {
      coordinate: route.points[0] ?? ([0, 0] as Coordinate),
      heading: 0,
      progress,
    };
  const segmentLengths = route.points
    .slice(1)
    .map((point, index) => distanceBetween(route.points[index], point));
  const total = segmentLengths.reduce((sum, value) => sum + value, 0);
  const target = total * progress;
  let travelled = 0;
  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (travelled + length >= target || index === segmentLengths.length - 1) {
      const local = length === 0 ? 0 : (target - travelled) / length;
      const start = route.points[index];
      const end = route.points[index + 1];
      const currentHeading = bearingBetween(start, end);
      const nextHeading =
        index + 2 < route.points.length
          ? bearingBetween(end, route.points[index + 2])
          : currentHeading;
      return {
        coordinate: [
          start[0] + (end[0] - start[0]) * local,
          start[1] + (end[1] - start[1]) * local,
        ] as Coordinate,
        heading: interpolateHeading(
          currentHeading,
          nextHeading,
          Math.max(0, Math.min(1, local)),
        ),
        progress,
      };
    }
    travelled += length;
  }
  return { coordinate: route.points.at(-1)!, heading: 0, progress };
}
