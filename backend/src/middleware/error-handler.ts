import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

export function notFound(request: Request, _response: Response, next: NextFunction): void {
  next(new ApiError(404, `Route ${request.method} ${request.path} not found`, "NOT_FOUND"));
}

export function errorHandler(error: unknown, request: Request, response: Response, _next: NextFunction): void {
  let normalized = error instanceof ApiError ? error : new ApiError(500, "Internal server error");

  if (error instanceof ZodError) normalized = new ApiError(422, "Validation failed", "VALIDATION_ERROR", error.flatten());
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") normalized = new ApiError(409, "A record with this value already exists", "CONFLICT", error.meta);
    if (error.code === "P2025") normalized = new ApiError(404, "Record not found", "NOT_FOUND");
    if (error.code === "P2003") normalized = new ApiError(409, "This record is still referenced by another resource", "DEPENDENCY_CONFLICT", error.meta);
  }

  if (normalized.statusCode >= 500) {
    logger.error("request.failed", { requestId: request.requestId, error, path: request.originalUrl });
  }

  response.status(normalized.statusCode).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      requestId: request.requestId
    }
  });
}
