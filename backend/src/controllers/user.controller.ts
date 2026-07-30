import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { paginationMeta } from "../utils/pagination";

export const userController = {
  list: async (request: Request, response: Response) => {
    const { page, limit, search } = request.query as unknown as { page: number; limit: number; search?: string };
    const where = search ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { firstName: { contains: search, mode: "insensitive" as const } }, { lastName: { contains: search, mode: "insensitive" as const } }] } : {};
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true } }),
      prisma.user.count({ where })
    ]);
    response.json({ success: true, data, meta: paginationMeta(total, page, limit) });
  },
  update: async (request: Request, response: Response) => {
    if (request.user?.id === request.params.id && (request.body.active === false || (request.body.role && request.body.role !== "ADMIN"))) {
      throw new ApiError(409, "You cannot remove your own administrator access", "SELF_LOCKOUT_PREVENTED");
    }
    const data = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.update({
        where: { id: request.params.id! },
        data: request.body,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true }
      });
      if (request.body.active === false) {
        await transaction.session.updateMany({ where: { userId: updated.id, revokedAt: null }, data: { revokedAt: new Date() } });
      }
      return updated;
    });
    response.json({ success: true, data });
  }
};
