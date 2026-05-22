import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { captureException } from "../config/sentry.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/appError.js";
import { sendError } from "../utils/apiResponse.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.path}`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.code, error.message, error.fields);
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    sendError(res, 404, "NOT_FOUND", "Resource not found");
    return;
  }

  if (isMongoDuplicateError(error)) {
    sendError(res, 409, "CONFLICT", "Resource already exists");
    return;
  }

  captureException(error);
  logger.error("Unhandled API error", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined
  });

  sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
}

function isMongoDuplicateError(error: unknown): error is { code: 11000 } {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

