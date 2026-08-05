import type { Request } from "express";
import { ApiError } from "./api-error";
import { validatedParams } from "./request-data";

/** Returns one validated route parameter as a non-empty string. */
export function routeParam(request: Request, name = "id"): string {
  const params = validatedParams<Record<string, unknown>>(request);
  const value = params[name];

  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(
      400,
      `Invalid route parameter: ${name}`,
      "INVALID_ROUTE_PARAMETER"
    );
  }

  return value;
}
