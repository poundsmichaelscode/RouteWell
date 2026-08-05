import { describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../src/config/prisma", () => ({ prisma: { $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]) } }));
vi.mock("../src/config/redis", () => ({ redis: { ping: vi.fn().mockResolvedValue("PONG") } }));

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_ACCESS_SECRET = "test-access-secret-that-is-more-than-32-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-more-than-32-characters";
process.env.FRONTEND_URL = "http://localhost:3000";

const { createApp } = await import("../src/app");

describe("health endpoints", () => {
  it("returns liveness", async () => {
    const response = await request(createApp()).get("/health/live");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
  it("returns readiness", async () => {
    const response = await request(createApp()).get("/health/ready");
    expect(response.status).toBe(200);
    expect(response.body.checks.database).toBe("ok");
  });
  it("returns a client error for malformed JSON", async () => {
    const response = await request(createApp())
      .post("/api/v1/auth/login")
      .set("content-type", "application/json")
      .send('{"email":');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_JSON");
  });

});
