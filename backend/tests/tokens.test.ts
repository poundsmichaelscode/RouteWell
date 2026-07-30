import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.JWT_ACCESS_SECRET = "test-access-secret-that-is-more-than-32-characters";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-more-than-32-characters";
  process.env.FRONTEND_URL = "http://localhost:3000";
});

describe("token utilities", () => {
  it("signs and verifies an access token", async () => {
    const { signAccessToken, verifyAccessToken } = await import("../src/utils/tokens");
    const token = signAccessToken({ sub: "user-id", email: "user@example.com", role: "ADMIN" });
    expect(verifyAccessToken(token).email).toBe("user@example.com");
  });
});
