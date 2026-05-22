import type { Response } from "express";
import type { ErrorCode, FieldErrors } from "./appError.js";

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, pagination?: Pagination): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(pagination ? { pagination } : {})
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  fields?: FieldErrors
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(fields ? { fields } : {})
    }
  });
}

