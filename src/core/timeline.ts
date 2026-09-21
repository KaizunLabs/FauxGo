import {
  ServiceType,
  Simulation,
  SimulationPace,
  TimelineStage,
} from "./models";

const paceFactors: Record<SimulationPace, number> = {
  quick: 0.04,
  relaxed: 0.15,
  realtime: 1,
};
const minimumGap: Record<SimulationPace, number> = {
  quick: 8,
  relaxed: 20,
  realtime: 30,
};

type StageTemplate = Omit<TimelineStage, "offsetSeconds"> & {
  offsetSeconds: number;
};

const notice = (stageId: string, title: string, body: string) => ({
  id: `notice-${stageId}`,
  stageId,
  title,
  body,
});
const stage = (
  id: string,
  title: string,
  detail: string,
  offsetSeconds: number,
  anchor: TimelineStage["anchor"] = "created",
  manualActionLabel?: string,
): StageTemplate => ({
  id,
  title,
  detail,
  offsetSeconds,
  anchor,
  manualActionLabel,
  notification: notice(id, title, detail),
});

const templates: Record<ServiceType, StageTemplate[]> = {
  eats: [
    stage(
      "confirmed",
      "Order confirmed",
      "The kitchen has received your order.",
      0,
    ),
    stage(
      "preparing",
      "Preparing your order",
      "The kitchen has started cooking.",
      240,
    ),
    stage(
      "courier-assigned",
      "Courier assigned",
      "Your courier is heading to the restaurant.",
      600,
    ),
    stage(
      "at-restaurant",
      "Courier at restaurant",
      "The courier is waiting for the final items.",
      900,
    ),
    stage("picked-up", "Order picked up", "Your courier is on the way.", 1080),
    stage(
      "arriving",
      "Arriving soon",
      "The courier is close to your selected destination.",
      1500,
    ),
    stage(
      "arrived",
      "Courier arrived",
      "Your courier is at the selected destination.",
      1680,
    ),
    stage(
      "complete",
      "Delivered",
      "Your order is complete. Thanks for joining us.",
      1800,
    ),
  ],
  market: [
    stage("confirmed", "List received", "The store has received your list.", 0),
    stage(
      "picking",
      "Picking items",
      "Your shopper is finding your items.",
      300,
    ),
    stage(
      "substitutions",
      "Substitutions checked",
      "Your saved substitution choices were applied.",
      660,
    ),
    stage("packing", "Packing", "Your items are being packed.", 900),
    stage(
      "courier-assigned",
      "Courier assigned",
      "Your courier is heading to the store.",
      1080,
    ),
    stage(
      "picked-up",
      "Order picked up",
      "The courier is following the route.",
      1320,
    ),
    stage(
      "arriving",
      "Arriving soon",
      "Your groceries are nearly there.",
      1620,
    ),
    stage("complete", "Delivered", "Your order is complete.", 1800),
  ],
  ride: [
    stage(
      "searching",
      "Finding a driver",
      "Finding a driver near your pickup.",
      0,
    ),
    stage(
      "assigned",
      "Driver assigned",
      "Your driver is heading to pickup.",
      180,
    ),
    stage(
      "approaching",
      "Driver approaching",
      "The vehicle is following the route to you.",
      420,
    ),
    stage(
      "arrived",
      "Driver arrived",
      "Your driver is at the pickup point.",
      600,
    ),
    stage(
      "waiting",
      "Waiting for you",
      "Start your ride when you’re ready.",
      720,
      "created",
      "Start ride",
    ),
    stage(
      "travelling",
      "Ride started",
      "Your trip is under way.",
      0,
      "manual-start",
    ),
    stage(
      "near-destination",
      "Approaching destination",
      "You are nearing the selected destination.",
      600,
      "manual-start",
    ),
    stage(
      "complete",
      "Ride complete",
      "You’ve reached your destination.",
      900,
      "manual-start",
    ),
  ],
  black: [
    stage(
      "confirmed",
      "Chauffeur requested",
      "Arranging your premium vehicle.",
      0,
    ),
    stage(
      "assigned",
      "Chauffeur assigned",
      "Your chauffeur is on the way.",
      240,
    ),
    stage(
      "arrived",
      "Vehicle ready",
      "Your chauffeur is waiting at pickup.",
      600,
    ),
    stage(
      "waiting",
      "Ready when you are",
      "Start the journey when you’re ready.",
      720,
      "created",
      "Start journey",
    ),
    stage(
      "travelling",
      "Journey started",
      "Settle in and enjoy the journey.",
      0,
      "manual-start",
    ),
    stage(
      "near-destination",
      "Approaching destination",
      "Your selected destination is close.",
      720,
      "manual-start",
    ),
    stage(
      "complete",
      "Journey complete",
      "You’ve arrived. Enjoy the rest of your day.",
      960,
      "manual-start",
    ),
  ],
  air: [
    stage("confirmed", "Flight confirmed", "Your itinerary is ready.", 0),
    stage(
      "captain",
      "Captain assigned",
      "Your captain is preparing the aircraft.",
      300,
    ),
    stage(
      "ready",
      "Ready to board",
      "Your aircraft is ready. Begin when you’re ready.",
      720,
      "created",
      "Begin flight",
    ),
    stage(
      "airborne",
      "Airborne",
      "Enjoy the view along your route.",
      0,
      "manual-start",
    ),
    stage(
      "descent",
      "Descending",
      "The destination is approaching.",
      900,
      "manual-start",
    ),
    stage(
      "complete",
      "Flight complete",
      "Welcome to your destination.",
      1200,
      "manual-start",
    ),
  ],
  send: [
    stage(
      "confirmed",
      "Courier requested",
      "Finding a courier for your package.",
      0,
    ),
    stage(
      "assigned",
      "Courier assigned",
      "Your courier is heading to pickup.",
      240,
    ),
    stage("pickup", "At pickup", "Checking your package details.", 600),
    stage(
      "collected",
      "Package collected",
      "The courier is following the selected route.",
      780,
    ),
    stage(
      "arriving",
      "Approaching destination",
      "Your package is nearly there.",
      1260,
    ),
    stage("complete", "Delivered", "Your delivery is complete.", 1500),
  ],
};

function scaleAnchorStages(
  stages: StageTemplate[],
  pace: SimulationPace,
): TimelineStage[] {
  let previous = -minimumGap[pace];
  return stages.map((item) => {
    const scaled =
      item.offsetSeconds === 0
        ? 0
        : Math.max(
            previous + minimumGap[pace],
            Math.round(item.offsetSeconds * paceFactors[pace]),
          );
    previous = scaled;
    return { ...item, offsetSeconds: scaled };
  });
}

export function createTimeline(
  serviceType: ServiceType,
  pace: SimulationPace,
  tripDurationSeconds?: number,
): TimelineStage[] {
  const original = templates[serviceType];
  const manualDuration = original
    .filter((item) => item.anchor === "manual-start")
    .at(-1)?.offsetSeconds;
  const source = original.map((item) => ({
    ...item,
    offsetSeconds:
      item.anchor === "manual-start" && manualDuration && tripDurationSeconds
        ? Math.round(
            (item.offsetSeconds / manualDuration) * tripDurationSeconds,
          )
        : item.offsetSeconds,
  }));
  return [
    ...scaleAnchorStages(
      source.filter((item) => item.anchor === "created"),
      pace,
    ),
    ...scaleAnchorStages(
      source.filter((item) => item.anchor === "manual-start"),
      pace,
    ),
  ];
}

export type SimulationSnapshot = {
  stageIndex: number;
  stage: TimelineStage;
  progress: number;
  routeProgress: number;
  complete: boolean;
  awaitingManualStart: boolean;
  elapsedSeconds: number;
};

export function deriveSnapshot(
  simulation: Simulation,
  now = Date.now(),
): SimulationSnapshot {
  if (simulation.completedAt !== undefined && simulation.completedAt <= now)
    return {
      stageIndex: simulation.stages.length - 1,
      stage: simulation.stages.at(-1)!,
      progress: 1,
      routeProgress: 1,
      complete: true,
      awaitingManualStart: false,
      elapsedSeconds: Math.max(0, (now - simulation.createdAt) / 1000),
    };
  const createdStages = simulation.stages.filter(
    (item) => item.anchor === "created",
  );
  const manualStages = simulation.stages.filter(
    (item) => item.anchor === "manual-start",
  );
  const createdElapsed = Math.max(0, (now - simulation.createdAt) / 1000);
  const gate = createdStages.find((item) => item.manualActionLabel);
  const reachedCreated = createdStages.reduce(
    (result, item) => (createdElapsed >= item.offsetSeconds ? item : result),
    createdStages[0],
  );
  const validManualStart =
    simulation.manualStartedAt !== undefined &&
    gate !== undefined &&
    simulation.manualStartedAt >=
      simulation.createdAt + gate.offsetSeconds * 1000 &&
    simulation.manualStartedAt <= now;
  const awaitingManualStart = Boolean(
    gate && reachedCreated.id === gate.id && !validManualStart,
  );
  let active = reachedCreated;
  let elapsedSeconds = createdElapsed;
  if (validManualStart && manualStages.length) {
    const manualElapsed = Math.max(
      0,
      (now - simulation.manualStartedAt!) / 1000,
    );
    active = manualStages.reduce(
      (result, item) => (manualElapsed >= item.offsetSeconds ? item : result),
      manualStages[0],
    );
    elapsedSeconds = manualElapsed;
  }
  const stageIndex = simulation.stages.findIndex(
    (item) => item.id === active.id && item.anchor === active.anchor,
  );
  const finalAnchorStages = manualStages.length ? manualStages : createdStages;
  const finalOffset = finalAnchorStages.at(-1)?.offsetSeconds ?? 1;
  const progress = awaitingManualStart
    ? 0
    : Math.max(0, Math.min(1, elapsedSeconds / Math.max(1, finalOffset)));
  const complete = active.id === "complete";
  const travelStart =
    createdStages.find((item) => ["picked-up", "collected"].includes(item.id))
      ?.offsetSeconds ?? 0;
  const routeProgress = manualStages.length
    ? validManualStart
      ? progress
      : 0
    : Math.max(
        0,
        Math.min(
          1,
          (createdElapsed - travelStart) /
            Math.max(1, finalOffset - travelStart),
        ),
      );
  return {
    stageIndex,
    stage: active,
    progress,
    routeProgress,
    complete,
    awaitingManualStart,
    elapsedSeconds,
  };
}

export function pendingNotificationEvents(
  simulation: Simulation,
  since: number,
  now: number,
) {
  return simulation.stages
    .filter((item) => {
      if (!item.notification) return false;
      const anchor =
        item.anchor === "created"
          ? simulation.createdAt
          : simulation.manualStartedAt;
      if (anchor === undefined) return false;
      const timestamp = anchor + item.offsetSeconds * 1000;
      return timestamp > since && timestamp <= now;
    })
    .map((item) => item.notification!);
}
