import { describe, expect, it } from "vitest";
import { titleCase } from "./utils";

describe("titleCase", () => {
  it("formats API enum values for display", () => {
    expect(titleCase("IN_TRANSIT")).toBe("In Transit");
    expect(titleCase("REFRIGERATED_TRUCK")).toBe("Refrigerated Truck");
  });
});
