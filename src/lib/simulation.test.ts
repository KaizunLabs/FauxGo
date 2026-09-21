import { describe, expect, it, vi } from "vitest";
import {
  createSimulationId,
  currentStageIndex,
  isSimulationComplete,
  simulationProgress,
  stagesFor,
} from "./simulation";
import { Simulation } from "@/types";

const build = (createdAt = 1_000): Simulation => ({
  id: "fg-test",
  serviceId: "ride",
  title: "Calm ride",
  subtitle: "A to B",
  total: 12,
  createdAt,
  stages: stagesFor("ride"),
  origin: "A",
  destination: "B",
  operatorName: "Mara",
  vehicle: "Test car",
});

describe("simulation lifecycle", () => {
  it("builds ordered stages ending with a clear non-transaction disclosure", () => {
    const stages = stagesFor("food");
    expect(stages.map((stage) => stage.offsetSeconds)).toEqual([
      0, 12, 24, 36, 48, 60,
    ]);
    expect(stages.at(-1)?.detail).toContain("no payment");
  });
  it("advances deterministically from timestamps and survives restarts", () => {
    const simulation = build();
    expect(currentStageIndex(simulation, 1_000)).toBe(0);
    expect(currentStageIndex(simulation, 25_000)).toBe(2);
    expect(currentStageIndex(simulation, 61_000)).toBe(5);
  });
  it("clamps progress and completion", () => {
    const simulation = build();
    expect(simulationProgress(simulation, 0)).toBe(0);
    expect(simulationProgress(simulation, 31_000)).toBe(0.5);
    expect(simulationProgress(simulation, 999_000)).toBe(1);
    expect(isSimulationComplete(simulation, 60_999)).toBe(false);
    expect(isSimulationComplete(simulation, 61_000)).toBe(true);
  });
  it("creates locally unique prefixed identifiers", () => {
    vi.spyOn(Date, "now").mockReturnValue(1234);
    const first = createSimulationId();
    const second = createSimulationId();
    expect(first).toMatch(/^fg-/);
    expect(first).not.toBe(second);
    vi.restoreAllMocks();
  });
});
