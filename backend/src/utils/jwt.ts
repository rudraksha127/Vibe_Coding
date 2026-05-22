import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

export type UserRole = "user" | "admin";

export type AccessTokenPayload = JwtPayload & {
  sub: string;
  typ: "access";
  role: UserRole;
  sessionId: string;
};

export type RefreshTokenPayload = JwtPayload & {
  sub: string;
  typ: "refresh";
  sessionId: string;
};

export function signAccessToken(userId: string, role: UserRole, sessionId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>
  };

  return jwt.sign({ sub: userId, typ: "access", role, sessionId }, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(userId: string, sessionId: string): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>
  };

  return jwt.sign({ sub: userId, typ: "refresh", sessionId }, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (!isAccessPayload(payload)) {
      throw new AppError(401, "TOKEN_INVALID", "Invalid access token");
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "TOKEN_EXPIRED", "Access token expired");
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "TOKEN_INVALID", "Invalid access token");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (!isRefreshPayload(payload)) {
      throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
    }
    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
  }
}

function isAccessPayload(payload: string | JwtPayload): payload is AccessTokenPayload {
  return typeof payload !== "string" && payload.typ === "access" && typeof payload.sub === "string";
}

function isRefreshPayload(payload: string | JwtPayload): payload is RefreshTokenPayload {
  return typeof payload !== "string" && payload.typ === "refresh" && typeof payload.sub === "string";
}
