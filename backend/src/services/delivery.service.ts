import { DeliveryStatus, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { DeliveryRepository } from "../repositories/delivery.repository";
import { ApiError } from "../utils/api-error";
import { paginationMeta } from "../utils/pagination";

const repository = new DeliveryRepository();

function trackingNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `RW-${date}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export class DeliveryService {
  async list(page: number, limit: number, search?: string) {
    const { items, total } = await repository.list(page, limit, search);
    return { data: items, meta: paginationMeta(total, page, limit) };
  }

  async get(id: string) {
    const delivery = await repository.findById(id);
    if (!delivery) throw new ApiError(404, "Delivery not found", "DELIVERY_NOT_FOUND");
    return delivery;
  }

  create(input: import("@prisma/client").Prisma.DeliveryUncheckedCreateInput) {
    return prisma.delivery.create({
      data: { ...input, trackingNumber: trackingNumber(), events: { create: { status: DeliveryStatus.PENDING, note: "Delivery created" } } },
      include: { customer: true, driver: true, vehicle: true, route: true }
    });
  }

  update(id: string, input: import("@prisma/client").Prisma.DeliveryUncheckedUpdateInput) {
    return prisma.delivery.update({ where: { id }, data: input, include: { customer: true, driver: true, vehicle: true, route: true } });
  }

  async updateStatus(id: string, status: DeliveryStatus, data: { note?: string; latitude?: number; longitude?: number }, actorId: string) {
    const current = await this.get(id);
    const allowed: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
      ASSIGNED: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
      PICKED_UP: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.FAILED],
      IN_TRANSIT: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
      DELIVERED: [], FAILED: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED], CANCELLED: []
    };
    if (!allowed[current.status].includes(status)) throw new ApiError(409, `Cannot transition from ${current.status} to ${status}`, "INVALID_STATUS_TRANSITION");
    return prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.update({ where: { id }, data: { status, deliveredAt: status === DeliveryStatus.DELIVERED ? new Date() : undefined } });
      await tx.deliveryEvent.create({ data: { deliveryId: id, status, note: data.note, latitude: data.latitude, longitude: data.longitude, createdById: actorId } });
      const recipients = await tx.user.findMany({ where: { active: true, role: { in: [Role.ADMIN, Role.MANAGER] }, NOT: { id: actorId } }, select: { id: true } });
      if (recipients.length > 0) {
        await tx.notification.createMany({
          data: recipients.map((recipient) => ({ userId: recipient.id, title: `Delivery ${status.toLowerCase().replaceAll("_", " ")}`, message: `${current.trackingNumber} changed from ${current.status} to ${status}.` }))
        });
      }
      return delivery;
    });
  }

  remove(id: string) { return prisma.delivery.delete({ where: { id } }); }
}
