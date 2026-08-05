import { DeliveryStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import type { AuthenticatedUser } from "../utils/request-user";

const GLOBAL_CACHE_KEY = "dashboard:summary:global";
const CACHE_SECONDS = 60;

function deliveryScope(actor: AuthenticatedUser): Prisma.DeliveryWhereInput {
  return actor.role === Role.DRIVER
    ? { driver: { is: { userId: actor.id } } }
    : {};
}

export class DashboardService {
  async summary(actor: AuthenticatedUser) {
    const isGlobal = actor.role !== Role.DRIVER;
    if (isGlobal) {
      const cached = await redis.get(GLOBAL_CACHE_KEY);
      if (cached) return JSON.parse(cached) as DashboardSummary;
    }

    const where = deliveryScope(actor);
    const statuses = Object.values(DeliveryStatus);

    const [deliveries, recent, statusCounts] = await Promise.all([
      prisma.delivery.count({ where }),
      prisma.delivery.findMany({
        where,
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { customer: true, driver: true, vehicle: true, route: true }
      }),
      Promise.all(
        statuses.map((status) =>
          prisma.delivery.count({ where: { AND: [where, { status }] } })
        )
      )
    ]);

    let drivers: number;
    let vehicles: number;
    let customers: number;

    if (actor.role === Role.DRIVER) {
      const [driverCount, vehicleRows, customerRows] = await Promise.all([
        prisma.driver.count({ where: { userId: actor.id } }),
        prisma.delivery.findMany({
          where: { AND: [where, { vehicleId: { not: null } }] },
          select: { vehicleId: true },
          distinct: ["vehicleId"]
        }),
        prisma.delivery.findMany({
          where,
          select: { customerId: true },
          distinct: ["customerId"]
        })
      ]);
      drivers = driverCount;
      vehicles = vehicleRows.length;
      customers = customerRows.length;
    } else {
      [drivers, vehicles, customers] = await Promise.all([
        prisma.driver.count(),
        prisma.vehicle.count(),
        prisma.customer.count()
      ]);
    }

    const status = statuses.reduce<Record<DeliveryStatus, number>>(
      (accumulator, key, index) => {
        accumulator[key] = statusCounts[index] ?? 0;
        return accumulator;
      },
      {} as Record<DeliveryStatus, number>
    );

    const result: DashboardSummary = {
      totals: { deliveries, drivers, vehicles, customers },
      status,
      recent
    };

    if (isGlobal) {
      await redis.set(GLOBAL_CACHE_KEY, JSON.stringify(result), "EX", CACHE_SECONDS);
    }

    return result;
  }

  async invalidate(): Promise<void> {
    await redis.del(GLOBAL_CACHE_KEY);
  }
}

type DashboardSummary = {
  totals: {
    deliveries: number;
    drivers: number;
    vehicles: number;
    customers: number;
  };
  status: Record<DeliveryStatus, number>;
  recent: unknown[];
};
