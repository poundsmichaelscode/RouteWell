import winston from "winston";
import { env } from "./env";

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: "routewell-api", environment: env.NODE_ENV },
  format: jsonFormat,
  transports: [new winston.transports.Console()]
});
