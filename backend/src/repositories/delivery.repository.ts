import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const include = { customer: true, driver: true, vehicle: true, route: true } satisfies Prisma.DeliveryInclude;

export class DeliveryRepository {
  async list(page: number, limit: number, search?: string) {
    const where: Prisma.DeliveryWhereInput = search ? {
      OR: [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { pickupAddress: { contains: search, mode: "insensitive" } },
        { deliveryAddress: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } }
      ]
    } : {};
    const [items, total] = await prisma.$transaction([
      prisma.delivery.findMany({ where, include, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.delivery.count({ where })
    ]);
    return { items, total };
  }

  findById(id: string) {
    return prisma.delivery.findUnique({ where: { id }, include: { ...include, events: { orderBy: { createdAt: "desc" } } } });
  }
}
