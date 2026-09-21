import { describe, expect, it } from "vitest";
import {
  notificationPlan,
  notificationSignature,
  reconcileNotifications,
} from "./notification-plan";
import { createSimulation, startManualJourney } from "./simulation";
import { defaultPreferences } from "./preferences";
import { regions } from "./regions";
import { createTimeline } from "./timeline";
const sample = () =>
  createSimulation({
    id: "notification-test",
    serviceType: "ride",
    title: "Economy",
    subtitle: "Trip",
    region: "IN",
    pace: "quick",
    origin: regions.IN.places[0],
    destination: regions.IN.places[1],
    vehicleId: "economy",
    now: 1000,
    quote: {
      currency: "INR",
      lines: [{ id: "base", label: "Fare", amountMinor: 10000, kind: "base" }],
      totalMinor: 10000,
      explanation: "Reference",
    },
  });
describe("local notification planning", () => {
  it("keeps unchanged alerts and replaces changed sound or timing", () => {
    const plan = notificationPlan(
      [sample()],
      { ...defaultPreferences(), notifications: true },
      1000,
    );
    const scheduled = plan.map((item) => ({
      id: item.id,
      signature: notificationSignature(item),
    }));
    expect(reconcileNotifications(plan, scheduled, 1000)).toEqual({
      cancel: [],
      schedule: [],
    });
    const changed = plan.map((item) => ({
      ...item,
      sound: !item.sound,
      date: item.date + 1000,
    }));
    expect(reconcileNotifications(changed, scheduled, 1000)).toEqual({
      cancel: scheduled.map((item) => item.id),
      schedule: changed,
    });
  });
  it("removes obsolete owned alerts without touching other notifications", () => {
    expect(
      reconcileNotifications(
        [],
        [{ id: "fauxgo:old" }, { id: "another-app" }],
        1000,
      ),
    ).toEqual({ cancel: ["fauxgo:old"], schedule: [] });
  });
  it("does not enqueue alerts that expired while awaiting the OS", () => {
    const plan = notificationPlan(
      [sample()],
      { ...defaultPreferences(), notifications: true },
      1000,
    );
    expect(
      reconcileNotifications(plan, [], Number.MAX_SAFE_INTEGER).schedule,
    ).toEqual([]);
  });
  it("does not schedule without opt in", () =>
    expect(notificationPlan([sample()], defaultPreferences(), 1000)).toEqual(
      [],
    ));
  it("never schedules a trip completion before the manual start", () => {
    const plan = notificationPlan(
      [sample()],
      { ...defaultPreferences(), notifications: true },
      1000,
    );
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.some((item) => item.title === "Ride complete")).toBe(false);
    expect(
      plan.every((item) => item.body.startsWith("FauxGo entertainment")),
    ).toBe(true);
  });
  it("schedules future manual stages after the user starts", () => {
    const initial = sample();
    const gate = createTimeline("ride", "quick").find(
      (stage) => stage.manualActionLabel,
    )!;
    const now = initial.createdAt + gate.offsetSeconds * 1000;
    const started = startManualJourney(initial, now);
    const plan = notificationPlan(
      [started],
      { ...defaultPreferences(), notifications: true },
      now,
    );
    expect(plan.some((item) => item.title === "Ride complete")).toBe(true);
    expect(plan.every((item) => item.date > now)).toBe(true);
  });
  it("respects service switches and bounds the OS queue", () => {
    expect(
      notificationPlan(
        [sample()],
        {
          ...defaultPreferences(),
          notifications: true,
          rideNotifications: false,
        },
        1000,
      ),
    ).toEqual([]);
    const many = Array.from({ length: 100 }, (_, index) => ({
      ...sample(),
      id: String(index),
    }));
    expect(
      notificationPlan(
        many,
        { ...defaultPreferences(), notifications: true },
        1000,
      ),
    ).toHaveLength(60);
  });
});
