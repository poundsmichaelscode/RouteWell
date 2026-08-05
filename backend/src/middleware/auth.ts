import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/tokens";

/**
 * Verifies the signed access token and re-checks the account in PostgreSQL.
 * This makes role changes and account suspension effective immediately rather
 * than waiting for the short-lived access token to expire.
 */
export async function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> {
  const bearer = request.header("authorization")?.replace(/^Bearer\s+/i, "");
  const token = (request.cookies?.accessToken as string | undefined) || bearer;
  if (!token) return next(new ApiError(401, "Authentication required", "UNAUTHENTICATED"));

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
    if (payload.type !== "access") throw new Error("Wrong token type");
  } catch {
    return next(new ApiError(401, "Invalid or expired access token", "INVALID_TOKEN"));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, active: true }
    });
    if (!user?.active) {
      return next(new ApiError(401, "Account is unavailable", "ACCOUNT_INACTIVE"));
    }

    request.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) return next(new ApiError(401, "Authentication required", "UNAUTHENTICATED"));
    if (!roles.includes(request.user.role)) return next(new ApiError(403, "Insufficient permissions", "FORBIDDEN"));
    next();
  };
}
