import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(request: Request, _response: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(request.method)) return next();
  if (!request.cookies?.accessToken && !request.cookies?.refreshToken) return next();

  const cookieToken = request.cookies?.csrfToken as string | undefined;
  const headerToken = request.header("x-csrf-token");
  if (!cookieToken || !headerToken) return next(new ApiError(403, "Missing CSRF token", "CSRF_TOKEN_MISSING"));

  const left = Buffer.from(cookieToken);
  const right = Buffer.from(headerToken);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return next(new ApiError(403, "Invalid CSRF token", "CSRF_TOKEN_INVALID"));
  }
  next();
}
