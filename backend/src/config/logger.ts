import winston from "winston";
import { env } from "./env.js";

const redacted = winston.format((info) => {
  for (const key of ["password", "token", "accessToken", "refreshToken", "authorization", "cookie"]) {
    if (key in info) {
      info[key] = "[REDACTED]";
    }
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    redacted(),
    winston.format.timestamp(),
    winston.format.errors({ stack: env.NODE_ENV !== "production" }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

