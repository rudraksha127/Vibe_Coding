import { AppError } from "./appError.js";
export function getRequestUser(req) {
    if (!req.user) {
        throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    return req.user;
}
