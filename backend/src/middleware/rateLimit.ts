import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse.js";

export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Too many requests. Please slow down.");
  }
});

export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Too many authentication attempts. Please retry shortly.");
  }
});

