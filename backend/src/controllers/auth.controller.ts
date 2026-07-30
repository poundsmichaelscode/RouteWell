import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { ApiError } from "../utils/api-error";
import { prisma } from "../config/prisma";

const service = new AuthService();
const metadata = (request: Request) => ({ ip: request.ip, userAgent: request.header("user-agent") });

export const authController = {
  register: async (request: Request, response: Response) => {
    const result = await service.register(request.body, metadata(request));
    setAuthCookies(response, result.accessToken, result.refreshToken, result.csrfToken);
    response.status(201).json({ success: true, data: { user: result.user } });
  },
  login: async (request: Request, response: Response) => {
    const result = await service.login(request.body.email, request.body.password, metadata(request));
    setAuthCookies(response, result.accessToken, result.refreshToken, result.csrfToken);
    response.json({ success: true, data: { user: result.user } });
  },
  refresh: async (request: Request, response: Response) => {
    const result = await service.refresh(request.cookies?.refreshToken as string | undefined, metadata(request));
    setAuthCookies(response, result.accessToken, result.refreshToken, result.csrfToken);
    response.json({ success: true, data: { user: result.user } });
  },
  logout: async (request: Request, response: Response) => {
    await service.logout(request.cookies?.refreshToken as string | undefined);
    clearAuthCookies(response);
    response.status(204).send();
  },
  updateMe: async (request: Request, response: Response) => {
    if (!request.user) throw new ApiError(401, "Authentication required");
    const user = await prisma.user.update({ where: { id: request.user.id }, data: request.body, select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true } });
    response.json({ success: true, data: user });
  },
  me: async (request: Request, response: Response) => {
    if (!request.user) throw new ApiError(401, "Authentication required");
    const user = await prisma.user.findUnique({ where: { id: request.user.id }, select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true } });
    if (!user || !user.active) throw new ApiError(401, "Account is unavailable", "ACCOUNT_INACTIVE");
    response.json({ success: true, data: user });
  }
};
