import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "@prisma/client";

export type AccessPayload = { sub: string; email: string; role: Role; type: "access" };
export type RefreshPayload = { sub: string; sessionId: string; type: "refresh" };

export function signAccessToken(payload: Omit<AccessPayload, "type">): string {
  return jwt.sign({ ...payload, type: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"],
    issuer: "routewell",
    audience: "routewell-web"
  });
}

export function signRefreshToken(payload: Omit<RefreshPayload, "type">): string {
  return jwt.sign({ ...payload, type: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as SignOptions["expiresIn"],
    issuer: "routewell",
    audience: "routewell-web"
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "routewell",
    audience: "routewell-web"
  }) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "routewell",
    audience: "routewell-web"
  }) as RefreshPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}
