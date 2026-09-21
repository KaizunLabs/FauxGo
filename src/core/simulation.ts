import { getService, getVehicle } from "./catalog";
import {
  Coordinate,
  Operator,
  PriceBreakdown,
  RegionCode,
  Route,
  SavedPlace,
  ServiceType,
  Simulation,
  SimulationPace,
} from "./models";
import { deterministicUnit } from "./pricing";
import { createDemoRoute } from "./route";
import { createTimeline, deriveSnapshot } from "./timeline";

const names: Record<RegionCode, string[]> = {
  IN: ["Ari", "Ishan", "Noor", "Mira", "Dev", "Tara"],
  US: ["Alex", "Mara", "Jordan", "Remi", "Sam", "Ari"],
  GB: ["Jamie", "Noor", "Sam", "Elliot", "Mara", "Alex"],
};

export function createSimulationId() {
  return (
    "fg-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

export function assignOperator(
  region: RegionCode,
  service: ServiceType,
  seed: string,
): Operator {
  const index =
    Math.floor(deterministicUnit(seed) * names[region].length) %
    names[region].length;
  return {
    id: `operator-${region}-${index}`,
    name: names[region][index],
    role:
      service === "air"
        ? "captain"
        : service === "black"
          ? "chauffeur"
          : ["eats", "market", "send"].includes(service)
            ? "courier"
            : "driver",
    rating: 4.8 + (index % 2) / 10,
    vehicle:
      service === "air"
        ? "Cloudline One"
        : ["Fern S", "Northline 4", "Juniper E"][index % 3],
    vehicleColor: ["Pearl", "Graphite", "Silver"][index % 3],
    plate: `FG ${218 + index * 97}`,
    message: "I’m on my way. You can follow my arrival here.",
  };
}

export function nearbyOrigin(
  destination: SavedPlace,
  seed: string,
): SavedPlace {
  const offset = 0.008 + deterministicUnit(seed) * 0.018;
  const coordinate: Coordinate = [
    Math.max(-180, Math.min(180, destination.coordinate[0] - offset)),
    Math.max(-85, Math.min(85, destination.coordinate[1] + offset * 0.65)),
  ];
  return {
    id: `pickup-${seed}`,
    label: "Pickup area",
    address: "Nearby pickup area",
    coordinate,
    kind: "custom",
  };
}

export function createSimulation(input: {
  id: string;
  serviceType: ServiceType;
  title: string;
  subtitle: string;
  region: RegionCode;
  pace: SimulationPace;
  origin: SavedPlace;
  destination: SavedPlace;
  vehicleId: string;
  quote: PriceBreakdown;
  route?: Route;
  now?: number;
  itemCount?: number;
}): Simulation {
  const vehicle = getVehicle(input.vehicleId);
  if (!vehicle || !getService(input.serviceType))
    throw new Error("Invalid service or vehicle");
  const route =
    input.route ??
    createDemoRoute(
      input.origin.coordinate,
      input.destination.coordinate,
      input.id,
    );
  return {
    schemaVersion: 2,
    id: input.id,
    serviceType: input.serviceType,
    title: input.title,
    subtitle: input.subtitle,
    createdAt: input.now ?? Date.now(),
    pace: input.pace,
    region: input.region,
    origin: input.origin,
    destination: input.destination,
    route,
    quote: input.quote,
    stages: createTimeline(
      input.serviceType,
      input.pace,
      route.durationSeconds,
    ),
    operator: assignOperator(input.region, input.serviceType, input.id),
    vehicle,
    itemCount: input.itemCount,
  };
}

export function startManualJourney(
  simulation: Simulation,
  now: number,
): Simulation {
  if (!deriveSnapshot(simulation, now).awaitingManualStart) return simulation;
  return { ...simulation, manualStartedAt: now };
}
