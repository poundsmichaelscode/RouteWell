import type { Request } from "express";

export function validatedQuery<T>(request: Request): T {
  return (request.validated?.query ?? request.query) as T;
}

export function validatedParams<T>(request: Request): T {
  return (request.validated?.params ?? request.params) as T;
}
