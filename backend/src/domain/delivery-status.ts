import { DeliveryStatus } from "@prisma/client";

export const DELIVERY_TRANSITIONS: Readonly<Record<DeliveryStatus, readonly DeliveryStatus[]>> = {
  PENDING: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
  ASSIGNED: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
  PICKED_UP: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.FAILED],
  IN_TRANSIT: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
  DELIVERED: [],
  FAILED: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
  CANCELLED: []
};

export function canTransitionDelivery(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return DELIVERY_TRANSITIONS[from].includes(to);
}
