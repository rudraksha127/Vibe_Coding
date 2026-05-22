export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "TOKEN_INVALID"
  | "REFRESH_TOKEN_INVALID"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export type FieldErrors = Record<string, string[]>;

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly fields?: FieldErrors;
  readonly isOperational = true;

  constructor(statusCode: number, code: ErrorCode, message: string, fields?: FieldErrors) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    if (fields) {
      this.fields = fields;
    }
  }
}
