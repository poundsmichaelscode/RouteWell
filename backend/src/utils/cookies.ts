import type { CookieOptions, Response } from "express";
import { env } from "../config/env";
import { durationToMilliseconds } from "./duration";

const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "strict",
  path: "/",
  domain: env.COOKIE_DOMAIN || undefined
};

export function setAuthCookies(response: Response, accessToken: string, refreshToken: string, csrfToken: string): void {
  response.cookie("accessToken", accessToken, { ...baseCookie, maxAge: durationToMilliseconds(env.ACCESS_TOKEN_TTL) });
  response.cookie("refreshToken", refreshToken, { ...baseCookie, path: "/api/v1/auth", maxAge: durationToMilliseconds(env.REFRESH_TOKEN_TTL) });
  response.cookie("csrfToken", csrfToken, {
    ...baseCookie,
    httpOnly: false,
    maxAge: durationToMilliseconds(env.REFRESH_TOKEN_TTL)
  });
}

export function clearAuthCookies(response: Response): void {
  response.clearCookie("accessToken", baseCookie);
  response.clearCookie("refreshToken", { ...baseCookie, path: "/api/v1/auth" });
  response.clearCookie("csrfToken", { ...baseCookie, httpOnly: false });
}
