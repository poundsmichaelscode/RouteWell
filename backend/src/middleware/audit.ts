import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export function audit(action: string, entity: string) {
  return (request: Request, response: Response, next: NextFunction): void => {
    response.on("finish", () => {
      if (!request.user || response.statusCode >= 400) return;
      void prisma.auditLog.create({
        data: {
          userId: request.user.id,
          action,
          entity,
          entityId: request.params.id,
          ipAddress: request.ip,
          userAgent: request.header("user-agent"),
          metadata: { method: request.method, path: request.originalUrl, requestId: request.requestId }
        }
      }).catch((error) => logger.warn("audit.write.failed", { error, requestId: request.requestId }));
    });
    next();
  };
}
