import { ServiceKind, Simulation, SimulationStage } from "@/types";

const sharedEnd: SimulationStage[] = [
  {
    title: "Almost there",
    detail: "The simulation is nearing its destination.",
    offsetSeconds: 36,
  },
  {
    title: "Arrived",
    detail: "Your imaginary journey has arrived.",
    offsetSeconds: 48,
  },
  {
    title: "Complete",
    detail: "No real service took place and no payment was made.",
    offsetSeconds: 60,
  },
];
const stageStarts: Record<ServiceKind, SimulationStage[]> = {
  food: [
    {
      title: "Kitchen confirmed",
      detail: "Your fictional kitchen is preparing the order.",
      offsetSeconds: 0,
    },
    {
      title: "Being prepared",
      detail: "Everything is coming together nicely.",
      offsetSeconds: 12,
    },
    {
      title: "Picked up",
      detail: "A simulated courier is on the way.",
      offsetSeconds: 24,
    },
  ],
  grocery: [
    {
      title: "List received",
      detail: "A fictional shopper has your list.",
      offsetSeconds: 0,
    },
    {
      title: "Being packed",
      detail: "Your pretend basket is nearly ready.",
      offsetSeconds: 12,
    },
    {
      title: "On the way",
      detail: "A simulated courier is heading over.",
      offsetSeconds: 24,
    },
  ],
  ride: [
    {
      title: "Finding your driver",
      detail: "Matching with a fictional nearby car.",
      offsetSeconds: 0,
    },
    {
      title: "Driver assigned",
      detail: "Mara is heading to the pickup point.",
      offsetSeconds: 12,
    },
    {
      title: "Trip started",
      detail: "Your imaginary route is under way.",
      offsetSeconds: 24,
    },
  ],
  premium: [
    {
      title: "Arranging your car",
      detail: "A fictional premium car is being assigned.",
      offsetSeconds: 0,
    },
    {
      title: "Chauffeur assigned",
      detail: "Ishan is heading to the pickup point.",
      offsetSeconds: 12,
    },
    {
      title: "Journey started",
      detail: "Settle into your imaginary quiet cabin.",
      offsetSeconds: 24,
    },
  ],
  courier: [
    {
      title: "Courier requested",
      detail: "Finding a fictional courier nearby.",
      offsetSeconds: 0,
    },
    {
      title: "Courier assigned",
      detail: "Noor is heading to the collection point.",
      offsetSeconds: 12,
    },
    {
      title: "Parcel collected",
      detail: "Your pretend parcel is in transit.",
      offsetSeconds: 24,
    },
  ],
  sky: [
    {
      title: "Concierge confirmed",
      detail: "Your fictional flight plan is being polished.",
      offsetSeconds: 0,
    },
    {
      title: "Craft assigned",
      detail: "Captain Celeste is ready when you are.",
      offsetSeconds: 12,
    },
    {
      title: "Airborne",
      detail: "Your entirely imaginary journey has begun.",
      offsetSeconds: 24,
    },
  ],
};
export const stagesFor = (serviceId: ServiceKind) => [
  ...stageStarts[serviceId],
  ...sharedEnd,
];
export const currentStageIndex = (simulation: Simulation, now = Date.now()) => {
  const elapsed = Math.max(0, (now - simulation.createdAt) / 1000);
  let index = 0;
  simulation.stages.forEach((stage, stageIndex) => {
    if (elapsed >= stage.offsetSeconds) index = stageIndex;
  });
  return index;
};
export const simulationProgress = (
  simulation: Simulation,
  now = Date.now(),
) => {
  const finalOffset = simulation.stages.at(-1)?.offsetSeconds ?? 60;
  return Math.min(
    1,
    Math.max(0, (now - simulation.createdAt) / 1000 / finalOffset),
  );
};
export const isSimulationComplete = (
  simulation: Simulation,
  now = Date.now(),
) => currentStageIndex(simulation, now) === simulation.stages.length - 1;
export const createSimulationId = () =>
  `fg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
