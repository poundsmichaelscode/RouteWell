import { z } from "zod";
import fs from "node:fs";

function secret(name: string): string | undefined {
  const direct = process.env[name];
  const file = process.env[`${name}_FILE`];
  if (direct) return direct;
  if (file && fs.existsSync(file)) return fs.readFileSync(file, "utf8").trim();
  return undefined;
}

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgresql://")),
  REDIS_URL: z.string().startsWith("redis://").default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  COOKIE_SECURE: z.string().default("false").transform((v) => v === "true"),
  COOKIE_DOMAIN: z.string().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info")
});

const parsed = schema.safeParse({
  ...process.env,
  DATABASE_URL: secret("DATABASE_URL"),
  REDIS_URL: secret("REDIS_URL") ?? process.env.REDIS_URL,
  JWT_ACCESS_SECRET: secret("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: secret("JWT_REFRESH_SECRET")
});

if (!parsed.success) {
  // Never log secret values; only field names and validation messages.
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = parsed.data;
