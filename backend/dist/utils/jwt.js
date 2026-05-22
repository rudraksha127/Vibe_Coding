import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";
export function signAccessToken(userId, role, sessionId) {
    const options = {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN
    };
    return jwt.sign({ sub: userId, typ: "access", role, sessionId }, env.JWT_ACCESS_SECRET, options);
}
export function signRefreshToken(userId, sessionId) {
    const options = {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN
    };
    return jwt.sign({ sub: userId, typ: "refresh", sessionId }, env.JWT_REFRESH_SECRET, options);
}
export function verifyAccessToken(token) {
    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        if (!isAccessPayload(payload)) {
            throw new AppError(401, "TOKEN_INVALID", "Invalid access token");
        }
        return payload;
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError(401, "TOKEN_EXPIRED", "Access token expired");
        }
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(401, "TOKEN_INVALID", "Invalid access token");
    }
}
export function verifyRefreshToken(token) {
    try {
        const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
        if (!isRefreshPayload(payload)) {
            throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
        }
        return payload;
    }
    catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
    }
}
function isAccessPayload(payload) {
    return typeof payload !== "string" && payload.typ === "access" && typeof payload.sub === "string";
}
function isRefreshPayload(payload) {
    return typeof payload !== "string" && payload.typ === "refresh" && typeof payload.sub === "string";
}
