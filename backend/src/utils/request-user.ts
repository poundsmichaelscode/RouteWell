import type { Request } from "express";
import { ApiError } from "./api-error";

export type AuthenticatedUser = NonNullable<Request["user"]>;

export function requireUser(request: Request): AuthenticatedUser {
  if (!request.user) {
    throw new ApiError(401, "Authentication required", "UNAUTHENTICATED");
  }
  return request.user;
}
