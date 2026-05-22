import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { parseDurationMs } from "../../utils/duration.js";
import { AppError } from "../../utils/appError.js";
import { getRequiredParam } from "../../utils/requestParam.js";
import { getRequestUser } from "../../utils/requestUser.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body, getContext(req));
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, getContext(req));
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = readRefreshCookie(req);
  const result = await authService.refresh(refreshToken, getContext(req));
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, { user: result.user, accessToken: result.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  await authService.logout(user.id, user.sessionId);
  clearRefreshCookie(res);
  sendSuccess(res, { ok: true });
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const sessions = await authService.listSessions(user.id);
  sendSuccess(res, sessions);
});

export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  await authService.revokeSession(user.id, getRequiredParam(req, "id"));
  sendSuccess(res, { ok: true });
});

function readRefreshCookie(req: Request): string {
  const value = req.cookies?.[env.REFRESH_COOKIE_NAME];
  if (typeof value !== "string") {
    throw new AppError(401, "REFRESH_TOKEN_INVALID", "Refresh token missing");
  }
  return value;
}

function getContext(req: Request): authService.AuthContext {
  const context: authService.AuthContext = {};
  const userAgent = req.get("user-agent");
  if (userAgent) {
    context.userAgent = userAgent;
  }
  if (req.ip) {
    context.ipAddress = req.ip;
  }
  return context;
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
    path: "/api/v1/auth"
  };
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(env.REFRESH_COOKIE_NAME, token, cookieOptions());
}

function clearRefreshCookie(res: Response): void {
  const options = cookieOptions();
  res.clearCookie(env.REFRESH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });
}
