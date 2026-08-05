import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { routeParam } from "../utils/route-param";

export const notificationController = {
  list: async (request: Request, response: Response) => {
    if (!request.user) throw new ApiError(401, "Authentication required");
    const data = await prisma.notification.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    response.json({ success: true, data });
  },
  markRead: async (request: Request, response: Response) => {
    if (!request.user) throw new ApiError(401, "Authentication required");
    const notificationId = routeParam(request);
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId: request.user.id },
      data: { readAt: new Date() }
    });
    if (result.count === 0) throw new ApiError(404, "Notification not found", "NOT_FOUND");
    response.status(204).send();
  },
  markAllRead: async (request: Request, response: Response) => {
    if (!request.user) throw new ApiError(401, "Authentication required");
    await prisma.notification.updateMany({ where: { userId: request.user.id, readAt: null }, data: { readAt: new Date() } });
    response.status(204).send();
  }
};
