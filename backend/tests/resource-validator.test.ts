import { describe, expect, it } from "vitest";
import { deliveryUpdate } from "../src/validators/resource.validator";

describe("delivery update validation", () => {
  const params = { id: "10000000-0000-4000-8000-000000000001" };

  it("does not allow status changes through the general update endpoint", () => {
    const result = deliveryUpdate.safeParse({
      body: { status: "DELIVERED" },
      params,
      query: {}
    });
    expect(result.success).toBe(false);
  });

  it("does not inject create-time defaults into partial updates", () => {
    const result = deliveryUpdate.parse({
      body: { notes: "Handle with care" },
      params,
      query: {}
    });
    expect(result.body).toEqual({ notes: "Handle with care" });
  });

  it("supports explicit relation removal", () => {
    const result = deliveryUpdate.parse({
      body: { driverId: null },
      params,
      query: {}
    });
    expect(result.body.driverId).toBeNull();
  });
});
