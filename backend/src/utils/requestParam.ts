import type { Request } from "express";
import { AppError } from "./appError.js";

export function getRequiredParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") {
    throw new AppError(400, "VALIDATION_ERROR", `Missing route parameter: ${name}`);
  }

  return value;
}
