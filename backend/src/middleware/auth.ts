import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/tokens";

export function authenticate(request: Request, _response: Response, next: NextFunction): void {
  const bearer = request.header("authorization")?.replace(/^Bearer\s+/i, "");
  const token = request.cookies?.accessToken as string | undefined || bearer;
  if (!token) return next(new ApiError(401, "Authentication required", "UNAUTHENTICATED"));

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") throw new Error("Wrong token type");
    request.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token", "INVALID_TOKEN"));
  }
}

export function authorize(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) return next(new ApiError(401, "Authentication required", "UNAUTHENTICATED"));
    if (!roles.includes(request.user.role)) return next(new ApiError(403, "Insufficient permissions", "FORBIDDEN"));
    next();
  };
}
