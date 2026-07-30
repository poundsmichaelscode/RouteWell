import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "../config/logger";
import { httpRequestDuration, httpRequestsTotal } from "../config/metrics";

export function requestContext(request: Request, response: Response, next: NextFunction): void {
  const requestId = request.header("x-request-id") || randomUUID();
  request.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  const started = process.hrtime.bigint();

  response.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - started) / 1_000_000_000;
    const route = request.route?.path ? `${request.baseUrl}${String(request.route.path)}` : request.path;
    httpRequestsTotal.inc({ method: request.method, route, status: String(response.statusCode) });
    httpRequestDuration.observe({ method: request.method, route, status: String(response.statusCode) }, duration);
    logger.http("request.completed", {
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Math.round(duration * 1000),
      userId: request.user?.id
    });
  });

  next();
}
