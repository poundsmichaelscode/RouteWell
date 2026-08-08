import { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { paginationMeta } from "../utils/pagination";
import { routeParam } from "../utils/route-param";
import { validatedQuery } from "../utils/request-data";
import { requireUser } from "../utils/request-user";

export const userController = {
  list: async (request: Request, response: Response) => {
    const { page, limit, search } = validatedQuery<{
      page: number;
      limit: number;
      search?: string;
    }>(request);

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } }
          ]
        }
      : {};

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    response.json({
      success: true,
      data,
      meta: paginationMeta(total, page, limit)
    });
  },

  update: async (request: Request, response: Response) => {
    const actor = requireUser(request);
    const userId = routeParam(request);

    if (
      actor.id === userId
      && (request.body.active === false
        || (request.body.role && request.body.role !== Role.ADMIN))
    ) {
      throw new ApiError(
        409,
        "You cannot remove your own administrator access",
        "SELF_LOCKOUT_PREVENTED"
      );
    }

    const data = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.update({
        where: { id: userId },
        data: request.body,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true
        }
      });

      if (request.body.active === false) {
        await transaction.session.updateMany({
          where: { userId: updated.id, revokedAt: null },
          data: { revokedAt: new Date() }
        });
      }

      if (request.body.role === Role.DRIVER) {
        await transaction.driver.updateMany({
          where: { email: updated.email, userId: null },
          data: { userId: updated.id }
        });
      } else if (request.body.role && request.body.role !== Role.DRIVER) {
        await transaction.driver.updateMany({
          where: { userId: updated.id },
          data: { userId: null }
        });
      }

      return updated;
    });

    response.json({ success: true, data });
  }
};
