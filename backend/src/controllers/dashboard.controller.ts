import { DeliveryStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { DashboardService } from "../services/dashboard.service";
import { requireUser } from "../utils/request-user";

const service = new DashboardService();

export const dashboardController = {
  summary: async (request: Request, response: Response) => {
    response.json({
      success: true,
      data: await service.summary(requireUser(request))
    });
  },

  system: async (_request: Request, response: Response) => {
    const databaseStarted = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const databaseLatencyMs = Date.now() - databaseStarted;

    const redisStarted = Date.now();
    await redis.ping();
    const redisLatencyMs = Date.now() - redisStarted;

    response.json({
      success: true,
      data: {
        status: "healthy",
        uptimeSeconds: Math.round(process.uptime()),
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        dependencies: {
          database: { status: "ok", latencyMs: databaseLatencyMs },
          redis: { status: "ok", latencyMs: redisLatencyMs }
        },
        timestamp: new Date().toISOString()
      }
    });
  },

  report: async (_request: Request, response: Response) => {
    const statuses = Object.values(DeliveryStatus);
    const rows = await Promise.all(
      statuses.map(async (status) => {
        const [count, weight] = await Promise.all([
          prisma.delivery.count({ where: { status } }),
          prisma.delivery.aggregate({ where: { status }, _avg: { weightKg: true } })
        ]);
        return { status, count, averageWeightKg: weight._avg.weightKg };
      })
    );

    response.json({ success: true, data: rows, generatedAt: new Date().toISOString() });
  }
};
