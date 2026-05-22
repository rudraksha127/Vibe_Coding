import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodType } from "zod";
import { AppError, type FieldErrors } from "../utils/appError.js";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request["query"];
      }
      next();
    } catch (error) {
      next(new AppError(400, "VALIDATION_ERROR", "Validation failed", toFieldErrors(error as ZodError)));
    }
  };
}

function toFieldErrors(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "request";
    fields[key] = [...(fields[key] ?? []), issue.message];
  }

  return fields;
}
