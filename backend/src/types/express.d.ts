import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        email: string;
        role: Role;
      };
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
