import { DeliveryStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { canTransitionDelivery } from "../src/domain/delivery-status";

describe("delivery state machine", () => {
  it("allows the happy-path transitions", () => {
    expect(canTransitionDelivery(DeliveryStatus.PENDING, DeliveryStatus.ASSIGNED)).toBe(true);
    expect(canTransitionDelivery(DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP)).toBe(true);
    expect(canTransitionDelivery(DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT)).toBe(true);
    expect(canTransitionDelivery(DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED)).toBe(true);
  });

  it("blocks terminal-state transitions", () => {
    expect(canTransitionDelivery(DeliveryStatus.DELIVERED, DeliveryStatus.IN_TRANSIT)).toBe(false);
    expect(canTransitionDelivery(DeliveryStatus.CANCELLED, DeliveryStatus.ASSIGNED)).toBe(false);
    expect(canTransitionDelivery(DeliveryStatus.ASSIGNED, DeliveryStatus.PENDING)).toBe(false);
  });
});
