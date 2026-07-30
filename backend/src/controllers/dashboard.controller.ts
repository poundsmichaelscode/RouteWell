import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";

const service = new DashboardService();
export const dashboardController = {
  summary: async (_request: Request, response: Response) => response.json({ success: true, data: await service.summary() }),
  system: async (_request: Request, response: Response) => {
    const databaseStarted = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const databaseLatencyMs = Date.now() - databaseStarted;
    const redisStarted = Date.now();
    await redis.ping();
    const redisLatencyMs = Date.now() - redisStarted;
    response.json({ success: true, data: { status: "healthy", uptimeSeconds: Math.round(process.uptime()), nodeVersion: process.version, memory: process.memoryUsage(), dependencies: { database: { status: "ok", latencyMs: databaseLatencyMs }, redis: { status: "ok", latencyMs: redisLatencyMs } }, timestamp: new Date().toISOString() } });
  },
  report: async (_request: Request, response: Response) => {
    const data = await prisma.delivery.groupBy({ by: ["status"], _count: { status: true }, _avg: { weightKg: true } });
    response.json({ success: true, data, generatedAt: new Date().toISOString() });
  }
};
