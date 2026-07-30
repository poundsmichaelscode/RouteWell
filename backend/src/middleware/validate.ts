import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/api-error";

export function validate(schema: ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: request.body, query: request.query, params: request.params });
    if (!result.success) {
      return next(new ApiError(422, "Request validation failed", "VALIDATION_ERROR", result.error.flatten()));
    }
    const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown };
    if (parsed.body !== undefined) request.body = parsed.body;
    if (parsed.query !== undefined && typeof parsed.query === "object") Object.assign(request.query, parsed.query);
    if (parsed.params !== undefined) request.params = parsed.params as Request["params"];
    next();
  };
}
