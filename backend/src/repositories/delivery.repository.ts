import { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { AuthenticatedUser } from "../utils/request-user";

const include = {
  customer: true,
  driver: true,
  vehicle: true,
  route: true
} satisfies Prisma.DeliveryInclude;

function accessScope(actor: AuthenticatedUser): Prisma.DeliveryWhereInput {
  return actor.role === Role.DRIVER
    ? { driver: { is: { userId: actor.id } } }
    : {};
}

export class DeliveryRepository {
  async list(page: number, limit: number, search: string | undefined, actor: AuthenticatedUser) {
    const searchScope: Prisma.DeliveryWhereInput = search
      ? {
          OR: [
            { trackingNumber: { contains: search, mode: "insensitive" } },
            { pickupAddress: { contains: search, mode: "insensitive" } },
            { deliveryAddress: { contains: search, mode: "insensitive" } },
            { customer: { is: { name: { contains: search, mode: "insensitive" } } } }
          ]
        }
      : {};

    const where: Prisma.DeliveryWhereInput = {
      AND: [accessScope(actor), searchScope]
    };

    const [items, total] = await prisma.$transaction([
      prisma.delivery.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.delivery.count({ where })
    ]);

    return { items, total };
  }

  findById(id: string) {
    return prisma.delivery.findUnique({
      where: { id },
      include: {
        ...include,
        events: { orderBy: { createdAt: "desc" } }
      }
    });
  }
}
