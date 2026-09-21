import { Simulation, UserPreference } from "./models";
export type PlannedNotification = {
  id: string;
  date: number;
  title: string;
  body: string;
  simulationId: string;
  sound: boolean;
};
export function notificationSignature(item: PlannedNotification): string {
  return JSON.stringify([
    item.date,
    item.title,
    item.body,
    item.simulationId,
    item.sound,
  ]);
}

export function reconcileNotifications(
  plan: PlannedNotification[],
  scheduled: { id: string; signature?: unknown }[],
  now: number,
) {
  const future = plan.filter((item) => item.date > now);
  const desired = new Map(future.map((item) => [item.id, item]));
  const existing = new Map(scheduled.map((item) => [item.id, item.signature]));
  return {
    cancel: scheduled
      .filter((item) => {
        if (!item.id.startsWith("fauxgo:")) return false;
        const next = desired.get(item.id);
        return !next || item.signature !== notificationSignature(next);
      })
      .map((item) => item.id),
    schedule: future.filter(
      (item) => existing.get(item.id) !== notificationSignature(item),
    ),
  };
}
export function notificationPlan(
  simulations: Simulation[],
  preferences: UserPreference,
  now: number,
): PlannedNotification[] {
  if (!preferences.notifications) return [];
  return simulations
    .flatMap((simulation) => {
      if (simulation.completedAt !== undefined && simulation.completedAt <= now)
        return [];
      const delivery = ["eats", "market", "send"].includes(
        simulation.serviceType,
      );
      if (
        delivery
          ? !preferences.deliveryNotifications
          : !preferences.rideNotifications
      )
        return [];
      return simulation.stages.flatMap((stage) => {
        const anchor =
          stage.anchor === "created"
            ? simulation.createdAt
            : simulation.manualStartedAt;
        if (anchor === undefined || !stage.notification) return [];
        const date = anchor + stage.offsetSeconds * 1000;
        if (date <= now) return [];
        return [
          {
            id: `fauxgo:${simulation.id}:${stage.id}`,
            date,
            title: stage.title,
            body: `FauxGo entertainment · ${stage.detail}`,
            simulationId: simulation.id,
            sound: preferences.sound,
          },
        ];
      });
    })
    .sort((a, b) => a.date - b.date)
    .slice(0, 60);
}
