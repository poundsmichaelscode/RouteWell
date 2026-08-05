import { describe, expect, it } from "vitest";
import { durationToMilliseconds } from "../src/utils/duration";

describe("durationToMilliseconds", () => {
  it("converts supported duration units", () => {
    expect(durationToMilliseconds("15m")).toBe(900_000);
    expect(durationToMilliseconds("7d")).toBe(604_800_000);
  });

  it("rejects unsupported values", () => {
    expect(() => durationToMilliseconds("one hour")).toThrow("Unsupported duration");
  });
});
