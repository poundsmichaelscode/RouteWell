import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/api-error";
import { hashToken, randomToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens";
import { durationToMilliseconds } from "../utils/duration";
import { env } from "../config/env";

const users = new UserRepository();

export class AuthService {
  async register(input: { firstName: string; lastName: string; email: string; password: string }, metadata: { ip?: string; userAgent?: string }) {
    if (!env.ALLOW_PUBLIC_REGISTRATION) {
      throw new ApiError(403, "Public registration is disabled", "REGISTRATION_DISABLED");
    }
    if (await users.findByEmail(input.email)) throw new ApiError(409, "Email is already registered", "EMAIL_EXISTS");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await users.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash
    });
    const tokens = await this.createSession(user, metadata);
    return { user, ...tokens };
  }

  async login(email: string, password: string, metadata: { ip?: string; userAgent?: string }) {
    const user = await users.findByEmail(email);
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.createSession(user, metadata);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        active: user.active
      },
      ...tokens
    };
  }

  async refresh(token: string | undefined, metadata: { ip?: string; userAgent?: string }) {
    if (!token) throw new ApiError(401, "Refresh token required", "REFRESH_TOKEN_REQUIRED");
    let payload: ReturnType<typeof verifyRefreshToken>;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
    }
    const session = await prisma.session.findUnique({ where: { id: payload.sessionId }, include: { user: true } });
    if (!session || !session.user.active || session.revokedAt || session.expiresAt < new Date() || session.refreshTokenHash !== hashToken(token)) {
      throw new ApiError(401, "Refresh session is invalid", "INVALID_SESSION");
    }
    const revoked = await prisma.session.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
        refreshTokenHash: hashToken(token),
        expiresAt: { gt: new Date() }
      },
      data: { revokedAt: new Date() }
    });
    if (revoked.count !== 1) {
      throw new ApiError(401, "Refresh token has already been used", "REFRESH_TOKEN_REUSED");
    }
    const tokens = await this.createSession(session.user, metadata);
    return { user: { id: session.user.id, email: session.user.email, firstName: session.user.firstName, lastName: session.user.lastName, role: session.user.role, active: session.user.active }, ...tokens };
  }

  async logout(token?: string) {
    if (!token) return;
    try {
      const payload = verifyRefreshToken(token);
      await prisma.session.updateMany({ where: { id: payload.sessionId }, data: { revokedAt: new Date() } });
    } catch { /* Expired or malformed tokens are treated as logged out. */ }
  }

  private async createSession(user: { id: string; email: string; role: Role }, metadata: { ip?: string; userAgent?: string }) {
    const session = await prisma.session.create({ data: { userId: user.id, refreshTokenHash: "pending", expiresAt: new Date(Date.now() + durationToMilliseconds(env.REFRESH_TOKEN_TTL)), ipAddress: metadata.ip, userAgent: metadata.userAgent } });
    const refreshToken = signRefreshToken({ sub: user.id, sessionId: session.id });
    await prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: hashToken(refreshToken) } });
    return {
      accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      refreshToken,
      csrfToken: randomToken(24)
    };
  }
}
