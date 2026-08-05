import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { registry } from "./config/metrics";
import { openapi } from "./docs/openapi";
import { csrfProtection } from "./middleware/csrf";
import { errorHandler, notFound } from "./middleware/error-handler";
import { globalRateLimit } from "./middleware/rate-limit";
import { requestContext } from "./middleware/request-context";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();
  app.set("trust proxy", ["loopback", "linklocal", "uniquelocal", "10.10.1.0/27"]);
  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use("/api-docs", helmet.contentSecurityPolicy({ directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:"] } }));
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token", "x-request-id"] }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use(globalRateLimit);
  app.use(csrfProtection);

  app.get("/health/live", (_request, response) => response.json({ status: "ok", service: "routewell-api" }));
  app.get("/health/ready", async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await redis.ping();
      response.json({ status: "ready", checks: { database: "ok", redis: "ok" } });
    } catch (error) {
      response.status(503).json({ status: "not-ready", error: error instanceof Error ? error.message : "Dependency unavailable" });
    }
  });
  app.get("/metrics", async (_request, response) => { response.setHeader("Content-Type", registry.contentType); response.send(await registry.metrics()); });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: "RouteWell API" }));
  app.get("/api-docs.json", (_request, response) => response.json(openapi));
  app.use("/api/v1", apiRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
