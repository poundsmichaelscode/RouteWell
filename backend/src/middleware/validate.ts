import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/api-error";

/**
 * Validates request input without mutating Express 5's getter-backed query
 * property. Parsed query and parameter values are stored on request.validated.
 */
export function validate(schema: ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: request.body,
      query: request.query,
      params: request.params
    });

    if (!result.success) {
      return next(
        new ApiError(
          422,
          "Request validation failed",
          "VALIDATION_ERROR",
          result.error.flatten()
        )
      );
    }

    const parsed = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };

    request.validated = parsed;
    if (parsed.body !== undefined) request.body = parsed.body;
    next();
  };
}
