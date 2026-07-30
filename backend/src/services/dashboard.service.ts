import { DeliveryStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";

export class DashboardService {
  async summary() {
    const cacheKey = "dashboard:summary";
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as unknown;

    const [deliveries, drivers, vehicles, customers, statusGroups, recent] = await prisma.$transaction([
      prisma.delivery.count(), prisma.driver.count(), prisma.vehicle.count(), prisma.customer.count(),
      prisma.delivery.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.delivery.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { customer: true, driver: true } })
    ]);
    const status = Object.fromEntries(Object.values(DeliveryStatus).map((key) => [key, 0]));
    for (const group of statusGroups) status[group.status] = group._count.status;
    const result = { totals: { deliveries, drivers, vehicles, customers }, status, recent };
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);
    return result;
  }
}
