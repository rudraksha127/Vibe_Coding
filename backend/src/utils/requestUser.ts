import type { Request } from "express";
import { AppError } from "./appError.js";

export function getRequestUser(req: Request): Express.User {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  return req.user;
}

